import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getPage, getSettings } from '$lib/server/content';
import { renderMarkdown } from '$lib/server/markdown';
import { supplierRegistrations } from '$lib/server/db/schema';
import { collectFiles, guardSubmission, hashIp, isEmail, RULES, storePrivateFile, str } from '$lib/server/forms';
import { notifyTeam } from '$lib/server/notify';
import { formatRut, isValidRut } from '$lib/utils/rut';
import { normalizeChileanPhone } from '$lib/utils/phone';

export const load: PageServerLoad = async ({ locals }) => {
	const page = await getPage(locals.db, 'proveedores');
	return { page, bodyHtml: renderMarkdown(page?.body) };
};

export const actions: Actions = {
	default: async ({ request, locals, getClientAddress, platform }) => {
		const form = await request.formData();
		const ip = getClientAddress();
		const values = {
			companyName: str(form, 'companyName', 160),
			rut: str(form, 'rut', 20),
			category: str(form, 'category', 120),
			contactName: str(form, 'contactName', 120),
			email: str(form, 'email', 160).toLowerCase(),
			phone: str(form, 'phone', 30),
			region: str(form, 'region', 80),
			website: str(form, 'website', 200),
			message: str(form, 'message', 2000),
			consent: form.get('consent') === 'on'
		};
		const spam = await guardSubmission(form, ip, platform);
		if (spam) return fail(400, { values, errors: { _form: spam } as Record<string, string> });

		const errors: Record<string, string> = {};
		if (values.companyName.length < 2) errors.companyName = 'Ingresa la razón social.';
		if (!isValidRut(values.rut)) errors.rut = 'Ingresa un RUT válido.';
		if (values.category.length < 2) errors.category = 'Indica el rubro o especialidad.';
		if (values.contactName.length < 2) errors.contactName = 'Ingresa el nombre de contacto.';
		if (!isEmail(values.email)) errors.email = 'Ingresa un correo válido.';
		if (values.phone && !normalizeChileanPhone(values.phone)) errors.phone = 'Teléfono no válido.';
		const { files, error: fileError } = collectFiles(form, 'file', RULES.supplier);
		if (fileError) errors.file = fileError;
		if (!values.consent) errors.consent = 'Debes aceptar la política de privacidad.';
		if (Object.keys(errors).length) return fail(400, { values, errors });

		const [row] = await locals.db
			.insert(supplierRegistrations)
			.values({
				companyName: values.companyName,
				rut: formatRut(values.rut),
				category: values.category,
				contactName: values.contactName,
				email: values.email,
				phone: values.phone ? normalizeChileanPhone(values.phone) : null,
				region: values.region || null,
				website: values.website || null,
				message: values.message || null,
				consentAt: new Date(),
				ipHash: await hashIp(ip)
			})
			.returning({ id: supplierRegistrations.id });
		if (files[0]) {
			const stored = await storePrivateFile('suppliers', row.id, files[0]);
			await locals.db.update(supplierRegistrations).set({ fileKey: stored.key, fileName: stored.filename }).where(eq(supplierRegistrations.id, row.id));
		}

		const settings = await getSettings(locals.db);
		const work = notifyTeam(settings, 'suppliers', {
			subject: `Nuevo registro de proveedor — ${values.companyName}`,
			title: 'Nuevo registro de proveedor',
			replyTo: values.email,
			adminPath: `/admin/proveedores/${row.id}`,
			rows: [
				['Razón social', values.companyName],
				['RUT', formatRut(values.rut)],
				['Rubro', values.category],
				['Contacto', values.contactName],
				['Correo', values.email],
				['Teléfono', values.phone],
				['Región', values.region]
			]
		});
		if (platform?.context?.waitUntil) platform.context.waitUntil(work);
		else await work;
		return { success: true };
	}
};
