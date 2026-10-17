import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { hashPassword, requirePermission, ROLE_LABELS } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { roleEnum, users } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	requirePermission(locals.user, 'users', 'read');
	const rows = await locals.db
		.select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, lastLoginAt: users.lastLoginAt })
		.from(users)
		.orderBy(asc(users.name));
	return { rows, roles: ROLE_LABELS };
};

function tempPassword() {
	const alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	const bytes = crypto.getRandomValues(new Uint8Array(12));
	return [...bytes].map((b) => alphabet[b % alphabet.length]).join('') + '7';
}

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const user = requirePermission(locals.user, 'users', 'write');
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const email = String(form.get('email') ?? '').trim().toLowerCase();
		const role = String(form.get('role'));
		if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !(roleEnum.enumValues as string[]).includes(role)) {
			return fail(400, { error: 'Completa nombre, correo válido y rol.' });
		}
		const [exists] = await locals.db.select({ id: users.id }).from(users).where(eq(users.email, email));
		if (exists) return fail(400, { error: 'Ya existe un usuario con ese correo.' });
		const password = tempPassword();
		const [row] = await locals.db
			.insert(users)
			.values({ name, email, role: role as 'editor', passwordHash: await hashPassword(password) })
			.returning({ id: users.id });
		await audit(locals.db, user, 'create', 'usuarios', row.id, `${email} (${role})`);
		return { created: { email, password } };
	}
};
