import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, count, eq, ne } from 'drizzle-orm';
import { hashPassword, requirePermission, ROLE_LABELS } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { roleEnum, sessions, users } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, params }) => {
	requirePermission(locals.user, 'users', 'read');
	const [u] = await locals.db
		.select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, lastLoginAt: users.lastLoginAt, createdAt: users.createdAt })
		.from(users)
		.where(eq(users.id, params.id));
	if (!u) error(404, 'Usuario no encontrado');
	return { u, roles: ROLE_LABELS };
};

/** Never leave the site without an active administrator. */
async function otherActiveAdmins(db: App.Locals['db'], id: string) {
	const [{ n }] = await db
		.select({ n: count() })
		.from(users)
		.where(and(eq(users.role, 'admin'), eq(users.active, true), ne(users.id, id)));
	return Number(n);
}

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const actor = requirePermission(locals.user, 'users', 'write');
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const role = String(form.get('role'));
		const active = form.get('active') === 'on';
		if (name.length < 2 || !(roleEnum.enumValues as string[]).includes(role)) return fail(400, { error: 'Datos no válidos.' });
		if ((role !== 'admin' || !active) && (await otherActiveAdmins(locals.db, params.id)) === 0) {
			const [cur] = await locals.db.select({ role: users.role }).from(users).where(eq(users.id, params.id));
			if (cur?.role === 'admin') return fail(400, { error: 'Debe existir al menos un administrador activo.' });
		}
		await locals.db.update(users).set({ name, role: role as 'admin', active }).where(eq(users.id, params.id));
		if (!active) await locals.db.delete(sessions).where(eq(sessions.userId, params.id));
		await audit(locals.db, actor, 'update', 'usuarios', params.id, `${role}${active ? '' : ' (desactivado)'}`);
		redirect(303, `/admin/usuarios/${params.id}?ok=guardado`);
	},
	reset: async ({ locals, params }) => {
		const actor = requirePermission(locals.user, 'users', 'write');
		const alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		const password = [...crypto.getRandomValues(new Uint8Array(12))].map((b) => alphabet[b % alphabet.length]).join('') + '7';
		await locals.db.update(users).set({ passwordHash: await hashPassword(password), failedLogins: 0, lockedUntil: null }).where(eq(users.id, params.id));
		await locals.db.delete(sessions).where(eq(sessions.userId, params.id));
		await audit(locals.db, actor, 'update', 'usuarios', params.id, 'Contraseña restablecida');
		return { password };
	}
};
