import type { Handle, HandleServerError } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getDb, type DB } from '$lib/server/db/client';
import { SESSION_COOKIE, validateSession } from '$lib/server/auth';
import { redirects } from '$lib/server/db/schema';

/* Redirect map (WordPress legacy URLs etc.), cached per isolate for 60 s. */
let redirectCache: { at: number; map: Map<string, { to: string; code: number }> } | null = null;

async function findRedirect(db: DB, path: string) {
	if (!redirectCache || Date.now() - redirectCache.at > 60_000) {
		const rows = await db.select().from(redirects);
		redirectCache = {
			at: Date.now(),
			map: new Map(rows.map((r) => [r.fromPath.replace(/\/+$/, '') || '/', { to: r.toPath, code: r.statusCode }]))
		};
	}
	return redirectCache.map.get(path.replace(/\/+$/, '') || '/');
}

const SKIP_REDIRECT = /^\/(admin|api|media|_app)(\/|$)/;

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.db = getDb(env.DATABASE_URL);
	event.locals.user = null;
	const path = event.url.pathname;
	const isAdmin = path === '/admin' || path.startsWith('/admin/');

	if (isAdmin) {
		const token = event.cookies.get(SESSION_COOKIE);
		if (token) event.locals.user = await validateSession(event.locals.db, token);
	} else if (event.request.method === 'GET' && !SKIP_REDIRECT.test(path)) {
		const r = await findRedirect(event.locals.db, path).catch(() => undefined);
		if (r) redirect(r.code as 301 | 302 | 307 | 308, r.to);
	}

	const response = await resolve(event, {
		preload: ({ type }) => type === 'font' || type === 'js' || type === 'css'
	});

	const h = response.headers;
	h.set('X-Content-Type-Options', 'nosniff');
	h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
	if (event.url.protocol === 'https:') h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	if (isAdmin) {
		h.set('X-Robots-Tag', 'noindex, nofollow');
		h.set('Cache-Control', 'private, no-store');
	}
	return response;
};

export const handleError: HandleServerError = ({ error, event, status }) => {
	if (status !== 404) console.error(`[${status}] ${event.request.method} ${event.url.pathname}`, error);
	return { message: status === 404 ? 'Página no encontrada' : 'Ocurrió un error inesperado' };
};
