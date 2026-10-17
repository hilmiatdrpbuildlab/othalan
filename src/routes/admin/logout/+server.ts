import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { destroySession } from '$lib/server/auth';
import { audit } from '$lib/server/audit';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (locals.user) await audit(locals.db, locals.user, 'logout', 'session');
	await destroySession(locals.db, cookies);
	redirect(303, '/admin/login');
};
