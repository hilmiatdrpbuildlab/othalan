import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getJob, getSettings } from '$lib/server/content';
import { renderMarkdown } from '$lib/server/markdown';
import { jobApplications } from '$lib/server/db/schema';
import { collectFiles, guardSubmission, hashIp, isEmail, RULES, storePrivateFile, str } from '$lib/server/forms';
import { confirmToSender, notifyTeam } from '$lib/server/notify';
import { formatRut, isValidRut } from '$lib/utils/rut';
import { normalizeChileanPhone } from '$lib/utils/phone';

const SPONTANEOUS = 'postulacion-espontanea';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (params.slug === SPONTANEOUS) return { job: null, bodyHtml: '' };
	const job = await getJob(locals.db, params.slug);
	if (!job) error(404, 'Esta oferta no existe o ya cerró');
	return { job, bodyHtml: renderMarkdown(job.body) };
};

export const actions: Actions = {
	default: async ({ request, locals, params, getClientAddress, platform }) => {
		const job = params.slug === SPONTANEOUS ? null : await getJob(locals.db, params.slug);
		if (params.slug !== SPONTANEOUS && !job) error(404, 'Esta oferta ya cerró');
		const form = await request.formData();
		const ip = getClientAddress();
		const values = {
			name: str(form, 'name', 120),
			rut: str(form, 'rut', 20),
			email: str(form, 'email', 160).toLowerCase(),
			phone: str(form, 'phone', 30),
			region: str(form, 'region', 80),
			position: str(form, 'position', 120),
			message: str(form, 'message', 2000),
			consent: form.get('consent') === 'on'
		};
		const spam = await guardSubmission(form, ip, platform);
		if (spam) return fail(400, { values, errors: { _form: spam } as Record<string, string> });

		const errors: Record<string, string> = {};
		if (values.name.length < 2) errors.name = 'Ingresa tu nombre completo.';
		if (values.rut && !isValidRut(values.rut)) errors.rut = 'El RUT no es válido.';
		if (!isEmail(values.email)) errors.email = 'Ingresa un correo válido.';
		const phone = normalizeChileanPhone(values.phone);
		if (!phone) errors.phone = 'Ingresa un teléfono válido. Ej: +56 9 1234 5678.';
		if (!job && values.position.length < 2) errors.position = 'Indica el cargo o área de interés.';
		const { files, error: fileError } = collectFiles(form, 'cv', RULES.cv);
		if (fileError) errors.cv = fileError;
		else if (!files.length) errors.cv = 'Adjunta tu CV en PDF o Word (máx. 5 MB).';
		if (!values.consent) errors.consent = 'Debes aceptar la política de privacidad.';
		if (Object.keys(errors).length) return fail(400, { values, errors });

		const [row] = await locals.db
			.insert(jobApplications)
			.values({
				jobId: job?.id ?? null,
				position: job?.title ?? values.position,
				name: values.name,
				rut: values.rut ? formatRut(values.rut) : null,
				email: values.email,
				phone,
				region: values.region || null,
				message: values.message || null,
				consentAt: new Date(),
				ipHash: await hashIp(ip)
			})
			.returning({ id: jobApplications.id });
		const stored = await storePrivateFile('cv', row.id, files[0]);
		await locals.db.update(jobApplications).set({ cvKey: stored.key, cvFilename: stored.filename }).where(eq(jobApplications.id, row.id));

		const settings = await getSettings(locals.db);
		const work = Promise.all([
			notifyTeam(settings, 'jobs', {
				subject: `Nueva postulación: ${job?.title ?? values.position} — ${values.name}`,
				title: 'Nueva postulación',
				replyTo: values.email,
				adminPath: `/admin/postulaciones/${row.id}`,
				rows: [
					['Cargo', job?.title ?? values.position],
					['Nombre', values.name],
					['RUT', values.rut],
					['Correo', values.email],
					['Teléfono', phone],
					['Región', values.region],
					['Mensaje', values.message]
				]
			}),
			confirmToSender(settings, values.email, 'Recibimos tu postulación', 'Gracias por postular', [
				`Hola ${values.name.split(' ')[0]}, recibimos tu postulación${job ? ` al cargo ${job.title}` : ''}.`,
				'Revisaremos tus antecedentes y te contactaremos si tu perfil avanza en el proceso. Conservamos tu CV por un año.'
			])
		]);
		if (platform?.context?.waitUntil) platform.context.waitUntil(work);
		else await work;
		return { success: true };
	}
};
