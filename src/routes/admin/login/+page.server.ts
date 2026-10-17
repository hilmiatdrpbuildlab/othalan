import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { audit } from '$lib/server/audit';
import { authenticate, createSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/admin');
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, url, platform, getClientAddress }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		if (!email || !password) return fail(400, { email, error: 'Ingresa tu correo y contraseña.' });

		const limiter = platform?.env?.FORM_LIMITER;
		if (limiter) {
			const { success } = await limiter.limit({ key: `login:${getClientAddress()}` });
			if (!success) return fail(429, { email, error: 'Demasiados intentos. Espera un minuto.' });
		}

		const { user, error } = await authenticate(locals.db, email, password);
		if (!user) return fail(400, { email, error });
		await createSession(locals.db, user.id, cookies, url.protocol === 'https:');
		await audit(locals.db, { id: user.id, email: user.email, name: user.name, role: user.role }, 'login', 'session');
		const next = url.searchParams.get('next');
		redirect(303, next && next.startsWith('/admin') ? next : '/admin');
	}
};
