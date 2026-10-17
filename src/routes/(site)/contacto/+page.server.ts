import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getOffices, getSettings } from '$lib/server/content';
import { contactMessages } from '$lib/server/db/schema';
import { guardSubmission, hashIp, isEmail, str } from '$lib/server/forms';
import { confirmToSender, notifyTeam } from '$lib/server/notify';
import { normalizeChileanPhone } from '$lib/utils/phone';

export const load: PageServerLoad = async ({ locals }) => ({ offices: await getOffices(locals.db) });

export const actions: Actions = {
	default: async ({ request, locals, getClientAddress, platform }) => {
		const form = await request.formData();
		const ip = getClientAddress();
		const values = {
			name: str(form, 'name', 120),
			email: str(form, 'email', 160).toLowerCase(),
			phone: str(form, 'phone', 30),
			company: str(form, 'company', 160),
			subject: str(form, 'subject', 160),
			message: str(form, 'message', 3000),
			consent: form.get('consent') === 'on'
		};
		const spam = await guardSubmission(form, ip, platform);
		if (spam) return fail(400, { values, errors: { _form: spam } as Record<string, string> });

		const errors: Record<string, string> = {};
		if (values.name.length < 2) errors.name = 'Ingresa tu nombre.';
		if (!isEmail(values.email)) errors.email = 'Ingresa un correo válido.';
		if (values.phone && !normalizeChileanPhone(values.phone)) errors.phone = 'Teléfono no válido. Ej: +56 9 1234 5678.';
		if (values.message.length < 10) errors.message = 'Escribe un mensaje de al menos 10 caracteres.';
		if (!values.consent) errors.consent = 'Debes aceptar la política de privacidad.';
		if (Object.keys(errors).length) return fail(400, { values, errors });

		const [row] = await locals.db
			.insert(contactMessages)
			.values({
				name: values.name,
				email: values.email,
				phone: values.phone ? normalizeChileanPhone(values.phone) : null,
				company: values.company || null,
				subject: values.subject || null,
				message: values.message,
				consentAt: new Date(),
				ipHash: await hashIp(ip)
			})
			.returning({ id: contactMessages.id });

		const settings = await getSettings(locals.db);
		const work = Promise.all([
			notifyTeam(settings, 'contact', {
				subject: `Nuevo mensaje de contacto — ${values.name}`,
				title: 'Nuevo mensaje de contacto',
				replyTo: values.email,
				adminPath: `/admin/mensajes/${row.id}`,
				rows: [
					['Nombre', values.name],
					['Empresa', values.company],
					['Correo', values.email],
					['Teléfono', values.phone],
					['Asunto', values.subject],
					['Mensaje', values.message]
				]
			}),
			confirmToSender(settings, values.email, 'Recibimos tu mensaje', 'Gracias por escribirnos', [
				`Hola ${values.name.split(' ')[0]}, recibimos tu mensaje y te responderemos a la brevedad.`
			])
		]);
		if (platform?.context?.waitUntil) platform.context.waitUntil(work);
		else await work;

		return { success: true };
	}
};
