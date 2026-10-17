import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import { hashPassword, passwordProblem, requirePermission, sha256, SESSION_COOKIE, verifyPassword } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { sessions, users } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	requirePermission(locals.user, 'dashboard');
	return {};
};

export const actions: Actions = {
	password: async ({ locals, request, cookies }) => {
		const user = requirePermission(locals.user, 'dashboard');
		const form = await request.formData();
		const current = String(form.get('current') ?? '');
		const next = String(form.get('next') ?? '');
		const confirm = String(form.get('confirm') ?? '');
		const [row] = await locals.db.select({ hash: users.passwordHash }).from(users).where(eq(users.id, user.id));
		if (!row || !(await verifyPassword(current, row.hash))) return fail(400, { error: 'La contraseña actual no es correcta.' });
		const problem = passwordProblem(next);
		if (problem) return fail(400, { error: problem });
		if (next !== confirm) return fail(400, { error: 'Las contraseñas nuevas no coinciden.' });
		await locals.db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, user.id));
		// Sign out every other session.
		const token = cookies.get(SESSION_COOKIE);
		if (token) await locals.db.delete(sessions).where(and(eq(sessions.userId, user.id), ne(sessions.id, await sha256(token))));
		await audit(locals.db, user, 'update', 'cuenta', user.id, 'Cambio de contraseña');
		return { ok: true };
	}
};
