import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { getServices, getSettings } from '$lib/server/content';
import { rfqFiles, rfqRequests } from '$lib/server/db/schema';
import { collectFiles, guardSubmission, hashIp, isEmail, RULES, storePrivateFile, str } from '$lib/server/forms';
import { confirmToSender, notifyTeam } from '$lib/server/notify';
import { formatRut, isValidRut } from '$lib/utils/rut';
import { normalizeChileanPhone } from '$lib/utils/phone';
import { REGIONES, SECTORES } from '$lib/utils/chile';

export const load: PageServerLoad = async ({ locals, url }) => {
	const services = await getServices(locals.db);
	return {
		services: services.map((s) => ({ id: s.id, slug: s.slug, title: s.title, icon: s.icon, summary: s.summary })),
		preselect: url.searchParams.get('servicio')
	};
};

export const actions: Actions = {
	default: async ({ request, locals, getClientAddress, platform, url }) => {
		const form = await request.formData();
		const ip = (() => {
			try {
				return getClientAddress();
			} catch {
				return null;
			}
		})();

		const values = {
			contactName: str(form, 'contactName', 120),
			company: str(form, 'company', 160),
			rut: str(form, 'rut', 20),
			position: str(form, 'position', 120),
			email: str(form, 'email', 160).toLowerCase(),
			phone: str(form, 'phone', 30),
			contactPreference: str(form, 'contactPreference', 20),
			serviceId: str(form, 'serviceId', 60),
			sectors: form.getAll('sectors').map(String).filter((s) => SECTORES.includes(s)),
			region: str(form, 'region', 80),
			comuna: str(form, 'comuna', 80),
			startDate: str(form, 'startDate', 10),
			tenderType: str(form, 'tenderType', 20),
			tenderNumber: str(form, 'tenderNumber', 80),
			description: str(form, 'description', 4000),
			areaM2: str(form, 'areaM2', 40),
			steelTons: str(form, 'steelTons', 40),
			budgetRange: str(form, 'budgetRange', 80),
			consent: form.get('consent') === 'on'
		};

		const spam = await guardSubmission(form, ip, platform);
		if (spam) return fail(400, { values, errors: { _form: spam } as Record<string, string> });

		const errors: Record<string, string> = {};
		if (values.contactName.length < 2) errors.contactName = 'Ingresa tu nombre.';
		if (!isEmail(values.email)) errors.email = 'Ingresa un correo válido, por ejemplo nombre@empresa.cl.';
		const phone = normalizeChileanPhone(values.phone);
		if (!phone) errors.phone = 'Ingresa un teléfono chileno válido, por ejemplo +56 9 1234 5678.';
		if (values.rut && !isValidRut(values.rut)) errors.rut = 'El RUT no es válido. Revisa el dígito verificador.';
		if (values.region && !REGIONES.includes(values.region)) errors.region = 'Selecciona una región de la lista.';
		if (values.description.length < 20) errors.description = 'Describe tu proyecto en al menos 20 caracteres.';
		if (values.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.startDate)) errors.startDate = 'Fecha inválida.';
		if (!values.consent) errors.consent = 'Debes aceptar la política de privacidad para enviar la solicitud.';
		const { files, error: fileError } = collectFiles(form, 'files', RULES.rfq);
		if (fileError) errors.files = fileError;
		if (Object.keys(errors).length) return fail(400, { values, errors });

		const db = locals.db;
		const services = await getServices(db);
		const service = services.find((s) => s.id === values.serviceId);

		// Sequential ticket per year: RFQ-2026-00001 (single atomic upsert, works on Neon HTTP).
		const year = new Date().getFullYear();
		const counter = await db.execute(
			sql`insert into rfq_counters (year, last) values (${year}, 1)
			    on conflict (year) do update set last = rfq_counters.last + 1 returning last`
		);
		const seq = Number((counter as unknown as { rows: { last: number }[] }).rows[0].last);
		const ticketCode = `RFQ-${year}-${String(seq).padStart(5, '0')}`;

		const utm = Object.fromEntries([...url.searchParams].filter(([k]) => k.startsWith('utm_')));
		const [rfq] = await db
			.insert(rfqRequests)
			.values({
				ticketCode,
				contactName: values.contactName,
				company: values.company || null,
				rut: values.rut ? formatRut(values.rut) : null,
				position: values.position || null,
				email: values.email,
				phone,
				contactPreference: values.contactPreference || null,
				serviceId: service?.id ?? null,
				serviceLabel: service?.title ?? 'Otro / por definir',
				sectors: values.sectors,
				region: values.region || null,
				comuna: values.comuna || null,
				startDate: values.startDate || null,
				tenderType: values.tenderType || null,
				tenderNumber: values.tenderNumber || null,
				description: values.description,
				areaM2: values.areaM2 || null,
				steelTons: values.steelTons || null,
				budgetRange: values.budgetRange || null,
				sourceUrl: request.headers.get('referer'),
				utm: Object.keys(utm).length ? utm : null,
				consentAt: new Date(),
				ipHash: await hashIp(ip)
			})
			.returning({ id: rfqRequests.id });

		for (const f of files) {
			const stored = await storePrivateFile('rfq', rfq.id, f);
			await db.insert(rfqFiles).values({ rfqId: rfq.id, storageKey: stored.key, filename: stored.filename, mime: stored.mime, bytes: stored.bytes });
		}

		const settings = await getSettings(db);
		const work = Promise.all([
			notifyTeam(settings, 'rfq', {
				subject: `Nueva solicitud de cotización ${ticketCode} — ${values.company || values.contactName}`,
				title: `Nueva cotización ${ticketCode}`,
				replyTo: values.email,
				adminPath: `/admin/cotizaciones/${rfq.id}`,
				rows: [
					['Nombre', values.contactName],
					['Empresa', values.company],
					['Correo', values.email],
					['Teléfono', phone],
					['Prefiere', values.contactPreference],
					['Servicio', service?.title ?? 'Otro / por definir'],
					['Ubicación', [values.comuna, values.region].filter(Boolean).join(', ')],
					['Licitación', values.tenderType === 'no' ? '' : [values.tenderType, values.tenderNumber].filter(Boolean).join(' · ')],
					['Presupuesto', values.budgetRange],
					['Descripción', values.description],
					['Adjuntos', files.length ? `${files.length} archivo(s)` : '']
				]
			}),
			confirmToSender(settings, values.email, `Recibimos tu solicitud ${ticketCode}`, 'Solicitud recibida', [
				`Hola ${values.contactName.split(' ')[0]}, gracias por contactar a ${settings.companyName}.`,
				`Tu número de solicitud es ${ticketCode}. Te responderemos en ${settings.rfqResponseTime}.`,
				'Si necesitas agregar información, responde este correo indicando el número de solicitud.'
			])
		]);
		if (platform?.context?.waitUntil) platform.context.waitUntil(work);
		else await work;

		redirect(303, `/cotizacion/gracias?ticket=${ticketCode}`);
	}
};
