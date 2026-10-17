import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getPage, getSettings } from '$lib/server/content';
import { renderMarkdown } from '$lib/server/markdown';
import { whistleblowerReports } from '$lib/server/db/schema';
import { guardSubmission, isEmail, str } from '$lib/server/forms';
import { notifyTeam } from '$lib/server/notify';
import { WHISTLEBLOWER_CATEGORIES } from '$lib/utils/chile';

export const load: PageServerLoad = async ({ locals }) => {
	const page = await getPage(locals.db, 'canal-de-denuncias');
	return { page, bodyHtml: renderMarkdown(page?.body) };
};

/** Folio with no personal data and no sequence (does not reveal volume): DEN-7K3Q-P9XA */
function folio() {
	const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	const bytes = crypto.getRandomValues(new Uint8Array(8));
	const s = [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
	return `DEN-${s.slice(0, 4)}-${s.slice(4)}`;
}

export const actions: Actions = {
	default: async ({ request, locals, getClientAddress, platform }) => {
		const form = await request.formData();
		const values = {
			category: str(form, 'category', 120),
			description: str(form, 'description', 6000),
			occurredAt: str(form, 'occurredAt', 120),
			location: str(form, 'location', 200),
			peopleInvolved: str(form, 'peopleInvolved', 500),
			anonymous: form.get('anonymous') === 'on',
			name: str(form, 'name', 120),
			email: str(form, 'email', 160),
			phone: str(form, 'phone', 30)
		};
		// No IP hash is stored for reports, to protect anonymity. The IP is only used for rate limiting.
		const spam = await guardSubmission(form, getClientAddress(), platform);
		if (spam) return fail(400, { values, errors: { _form: spam } as Record<string, string> });

		const errors: Record<string, string> = {};
		if (!WHISTLEBLOWER_CATEGORIES.includes(values.category)) errors.category = 'Selecciona el tipo de denuncia.';
		if (values.description.length < 30) errors.description = 'Describe los hechos con al menos 30 caracteres.';
		if (!values.anonymous && values.name.length < 2) errors.name = 'Ingresa tu nombre o marca la opción anónima.';
		if (!values.anonymous && values.email && !isEmail(values.email)) errors.email = 'Correo no válido.';
		if (Object.keys(errors).length) return fail(400, { values, errors });

		const code = folio();
		await locals.db.insert(whistleblowerReports).values({
			folio: code,
			category: values.category,
			description: values.description,
			occurredAt: values.occurredAt || null,
			location: values.location || null,
			peopleInvolved: values.peopleInvolved || null,
			anonymous: values.anonymous,
			name: values.anonymous ? null : values.name,
			email: values.anonymous ? null : values.email || null,
			phone: values.anonymous ? null : values.phone || null
		});

		const settings = await getSettings(locals.db);
		// Notification deliberately contains no details of the report — only that one exists.
		const work = notifyTeam(settings, 'reports', {
			subject: `Nueva denuncia recibida (${code})`,
			title: 'Canal de denuncias',
			adminPath: '/admin/denuncias',
			rows: [
				['Folio', code],
				['Tipo', values.category],
				['Aviso', 'Por confidencialidad, el detalle solo está disponible en el panel (acceso de administradores).']
			]
		});
		if (platform?.context?.waitUntil) platform.context.waitUntil(work);
		else await work;
		return { success: true, folio: code };
	}
};
