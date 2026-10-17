import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { can, requirePermission } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { getHomeSections } from '$lib/server/content';
import { mediaFor } from '$lib/server/cms/engine';
import { readShape } from '$lib/server/cms/shape';
import { homeSections } from '$lib/server/db/schema';
import { DEFAULT_HOME, HOME_SECTION_ORDER, type HomeSectionKey } from '$lib/site-config';
import type { ResourceDef } from '$lib/server/cms/resources';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requirePermission(locals.user, 'content', 'read');
	const sections = await getHomeSections(locals.db);
	const ids = sections.flatMap((s) => ('imageId' in (s.data as object) ? [(s.data as { imageId: string }).imageId] : [])).filter(Boolean);
	const fakeDef = { fields: [{ name: 'imageId', type: 'image' }], columns: [] } as unknown as ResourceDef;
	const media = await mediaFor(locals.db, fakeDef, ids.map((imageId) => ({ imageId })));
	return { sections, media, canWrite: can(user, 'content', 'write') };
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const user = requirePermission(locals.user, 'content', 'write');
		const form = await request.formData();
		const order = String(form.get('__order') ?? '')
			.split(',')
			.filter((k): k is HomeSectionKey => (HOME_SECTION_ORDER as string[]).includes(k));
		const keys = [...new Set([...order, ...HOME_SECTION_ORDER])];
		for (const [i, key] of keys.entries()) {
			const data = readShape(DEFAULT_HOME[key], key, form);
			const enabled = key === 'hero' ? true : form.get(`${key}.__enabled`) === 'on';
			const sortOrder = key === 'hero' ? 0 : i + 1;
			await locals.db
				.insert(homeSections)
				.values({ key, enabled, sortOrder, data: data as object })
				.onConflictDoUpdate({ target: homeSections.key, set: { enabled, sortOrder, data: data as object } });
		}
		await audit(locals.db, user, 'update', 'home', null, 'Página de inicio');
		redirect(303, '/admin/inicio?ok=guardado');
	}
};
