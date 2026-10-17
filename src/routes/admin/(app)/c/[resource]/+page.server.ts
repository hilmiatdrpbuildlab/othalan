import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { requirePermission } from '$lib/server/auth';
import { RESOURCE_MAP } from '$lib/server/cms/resources';
import { deleteRow, duplicateRow, listRows, mediaFor, moveRow, relationOptions, toMeta } from '$lib/server/cms/engine';

function resolve(key: string) {
	const def = RESOURCE_MAP.get(key);
	if (!def) error(404, 'Sección no encontrada');
	return def;
}

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const def = resolve(params.resource);
	const user = requirePermission(locals.user, def.module, 'read');
	const q = url.searchParams.get('q') ?? '';
	const status = url.searchParams.get('estado') ?? '';
	const page = Number(url.searchParams.get('pagina')) || 1;
	const result = await listRows(locals.db, def, { q, status, page });
	const [media, relations] = await Promise.all([mediaFor(locals.db, def, result.rows), relationOptions(locals.db, def)]);
	const rows = result.rows.map((r): Record<string, unknown> & { id: string; _public: string | null } => ({ ...(r as { id: string }), _public: def.publicPath && r.status === 'published' ? def.publicPath(r) : null }));
	return { meta: toMeta(def, user), ...result, rows, media, relations, q, status };
};

export const actions: Actions = {
	move: async ({ locals, params, request }) => {
		const def = resolve(params.resource);
		requirePermission(locals.user, def.module, 'write');
		const form = await request.formData();
		await moveRow(locals.db, def, String(form.get('id')), form.get('dir') === 'up' ? -1 : 1);
		return { moved: true };
	},
	delete: async ({ locals, params, request }) => {
		const def = resolve(params.resource);
		const user = requirePermission(locals.user, def.module, 'write');
		const id = String((await request.formData()).get('id'));
		await deleteRow(locals.db, def, id, user);
		return { deleted: true };
	},
	duplicate: async ({ locals, params, request }) => {
		const def = resolve(params.resource);
		const user = requirePermission(locals.user, def.module, 'write');
		const id = String((await request.formData()).get('id'));
		const newId = await duplicateRow(locals.db, def, id, user);
		if (!newId) return fail(404, { error: 'No encontrado' });
		redirect(303, `/admin/c/${def.key}/${newId}?ok=duplicado`);
	}
};
