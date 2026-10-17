import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { requirePermission } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { getSettings } from '$lib/server/content';
import { mediaFor } from '$lib/server/cms/engine';
import { readShape } from '$lib/server/cms/shape';
import type { ResourceDef } from '$lib/server/cms/resources';
import { siteSettings } from '$lib/server/db/schema';
import { DEFAULT_SETTINGS } from '$lib/site-config';
import { formatRut, isValidRut } from '$lib/utils/rut';
import { normalizeChileanPhone } from '$lib/utils/phone';

const imgDef = { fields: [{ name: 'a', type: 'image' }, { name: 'b', type: 'image' }], columns: [] } as unknown as ResourceDef;

export const load: PageServerLoad = async ({ locals }) => {
	requirePermission(locals.user, 'settings', 'read');
	const settings = await getSettings(locals.db);
	const media = await mediaFor(locals.db, imgDef, [{ a: settings.logoId, b: settings.seo.ogImageId }]);
	return { values: settings, media };
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const user = requirePermission(locals.user, 'settings', 'write');
		const form = await request.formData();
		const v = Object.fromEntries(
			Object.entries(DEFAULT_SETTINGS).map(([k, def]) => [k, readShape(def, k, form)])
		) as typeof DEFAULT_SETTINGS;

		const errors: Record<string, string> = {};
		if (v.rut) {
			if (!isValidRut(v.rut)) errors.rut = 'RUT no válido.';
			else v.rut = formatRut(v.rut);
		}
		for (const k of ['phone', 'whatsapp'] as const) {
			if (v[k]) {
				const n = normalizeChileanPhone(v[k]);
				if (!n) errors[k] = 'Teléfono no válido. Ej: +56 9 1234 5678';
				else v[k] = n;
			}
		}
		const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
		if (v.email && !emailRe.test(v.email)) errors.email = 'Correo no válido.';
		for (const [k, list] of Object.entries(v.notify)) {
			const bad = list
				.split(/[,;\s]+/)
				.filter(Boolean)
				.find((e) => !emailRe.test(e));
			if (bad) errors[`notify.${k}`] = `Correo no válido: ${bad}`;
		}
		for (const [k, url] of Object.entries(v.social)) if (url && !/^https:\/\//.test(url)) errors[`social.${k}`] = 'Debe comenzar con https://';
		if (v.mapEmbedUrl && !/^https:\/\/www\.google\.com\/maps\/embed/.test(v.mapEmbedUrl)) {
			errors.mapEmbedUrl = 'Usa el enlace "Insertar mapa" de Google Maps (https://www.google.com/maps/embed?...).';
		}
		if (Object.keys(errors).length) return fail(400, { errors, values: v });

		await locals.db
			.insert(siteSettings)
			.values({ key: 'site', value: v })
			.onConflictDoUpdate({ target: siteSettings.key, set: { value: v } });
		await audit(locals.db, user, 'update', 'settings', 'site', 'Configuración del sitio');
		redirect(303, '/admin/configuracion?ok=guardado');
	}
};
