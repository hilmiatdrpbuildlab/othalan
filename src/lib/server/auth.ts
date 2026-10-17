import { error, redirect, type Cookies } from '@sveltejs/kit';
import { and, eq, gt, lt } from 'drizzle-orm';
import type { DB } from './db/client';
import { sessions, users, type Role, type User } from './db/schema';

export const SESSION_COOKIE = 'oth_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // absolute max 7 days
const IDLE_TTL_MS = 12 * 60 * 60 * 1000; // 12 h idle
const PBKDF2_ITERATIONS = 100_000; // Workers' WebCrypto upper bound
const MAX_FAILED = 5;

const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer | Uint8Array) =>
	[...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string) => new Uint8Array(hex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));

export async function sha256(value: string): Promise<string> {
	return toHex(await crypto.subtle.digest('SHA-256', enc.encode(value)));
}

/* ─────────── Passwords (PBKDF2-SHA256, WebCrypto — runs on Workers and Node) ─────────── */

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
	const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations }, key, 256);
	return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
	return `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [algo, iter, saltHex, hashHex] = stored.split('$');
	if (algo !== 'pbkdf2_sha256' || !saltHex || !hashHex) return false;
	const hash = await pbkdf2(password, fromHex(saltHex), Number(iter));
	const expected = fromHex(hashHex);
	if (hash.length !== expected.length) return false;
	let diff = 0;
	for (let i = 0; i < hash.length; i++) diff |= hash[i] ^ expected[i];
	return diff === 0;
}

export function passwordProblem(password: string): string | null {
	if (password.length < 10) return 'La contraseña debe tener al menos 10 caracteres.';
	if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'Incluye letras y números.';
	return null;
}

/* ─────────── Sessions ─────────── */

export type SessionUser = Pick<User, 'id' | 'email' | 'name' | 'role'>;

export async function createSession(db: DB, userId: string, cookies: Cookies, secure: boolean) {
	const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
	await db.insert(sessions).values({ id: await sha256(token), userId, expiresAt });
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		expires: expiresAt
	});
}

export async function validateSession(db: DB, token: string): Promise<SessionUser | null> {
	const id = await sha256(token);
	const now = new Date();
	const rows = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
			active: users.active,
			lastSeenAt: sessions.lastSeenAt
		})
		.from(sessions)
		.innerJoin(users, eq(users.id, sessions.userId))
		.where(and(eq(sessions.id, id), gt(sessions.expiresAt, now)))
		.limit(1);
	const row = rows[0];
	if (!row || !row.active) return null;
	if (now.getTime() - row.lastSeenAt.getTime() > IDLE_TTL_MS) {
		await db.delete(sessions).where(eq(sessions.id, id));
		return null;
	}
	// Touch at most every 5 minutes to keep writes low.
	if (now.getTime() - row.lastSeenAt.getTime() > 5 * 60 * 1000) {
		await db.update(sessions).set({ lastSeenAt: now }).where(eq(sessions.id, id));
	}
	return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export async function destroySession(db: DB, cookies: Cookies) {
	const token = cookies.get(SESSION_COOKIE);
	if (token) await db.delete(sessions).where(eq(sessions.id, await sha256(token)));
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export async function purgeExpiredSessions(db: DB) {
	await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

/** Verifies credentials with progressive lockout. Returns the user or a Spanish error message. */
export async function authenticate(db: DB, email: string, password: string): Promise<{ user?: User; error?: string }> {
	const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
	const generic = 'Correo o contraseña incorrectos.';
	if (!user || !user.active) {
		await verifyPassword(password, 'pbkdf2_sha256$1000$00$00'); // equalise timing
		return { error: generic };
	}
	if (user.lockedUntil && user.lockedUntil > new Date()) {
		return { error: 'Cuenta bloqueada temporalmente por intentos fallidos. Intenta en 15 minutos.' };
	}
	if (!(await verifyPassword(password, user.passwordHash))) {
		const failed = user.failedLogins + 1;
		await db
			.update(users)
			.set({
				failedLogins: failed >= MAX_FAILED ? 0 : failed,
				lockedUntil: failed >= MAX_FAILED ? new Date(Date.now() + 15 * 60 * 1000) : null
			})
			.where(eq(users.id, user.id));
		return { error: generic };
	}
	await db.update(users).set({ failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() }).where(eq(users.id, user.id));
	return { user };
}

/* ─────────── Authorisation (RBAC) ─────────── */

export type Module =
	| 'dashboard'
	| 'content'
	| 'media'
	| 'leads'
	| 'jobs'
	| 'applications'
	| 'suppliers'
	| 'settings'
	| 'users'
	| 'audit'
	| 'reports';

/** Per execution_plan §5.1. `read` and `write` lists of roles. */
export const PERMISSIONS: Record<Module, { read: Role[]; write: Role[] }> = {
	dashboard: { read: ['admin', 'editor', 'comercial', 'rrhh'], write: [] },
	content: { read: ['admin', 'editor', 'comercial'], write: ['admin', 'editor'] },
	media: { read: ['admin', 'editor', 'comercial'], write: ['admin', 'editor'] },
	leads: { read: ['admin', 'editor', 'comercial'], write: ['admin', 'comercial'] },
	jobs: { read: ['admin', 'editor', 'rrhh'], write: ['admin', 'editor', 'rrhh'] },
	applications: { read: ['admin', 'rrhh'], write: ['admin', 'rrhh'] },
	suppliers: { read: ['admin', 'comercial'], write: ['admin', 'comercial'] },
	settings: { read: ['admin'], write: ['admin'] },
	users: { read: ['admin'], write: ['admin'] },
	audit: { read: ['admin'], write: ['admin'] },
	reports: { read: ['admin'], write: ['admin'] }
};

export function can(user: SessionUser | null | undefined, module: Module, mode: 'read' | 'write' = 'read'): boolean {
	return !!user && PERMISSIONS[module][mode].includes(user.role);
}

/** Server-side guard used in every admin load/action. */
export function requirePermission(user: SessionUser | null | undefined, module: Module, mode: 'read' | 'write' = 'read'): SessionUser {
	if (!user) redirect(303, '/admin/login');
	if (!can(user, module, mode)) error(403, 'No tienes permisos para esta sección.');
	return user;
}

export const ROLE_LABELS: Record<Role, string> = {
	admin: 'Administrador',
	editor: 'Editor de contenidos',
	comercial: 'Comercial',
	rrhh: 'Recursos humanos'
};
