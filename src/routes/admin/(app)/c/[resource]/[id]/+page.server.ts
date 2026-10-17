import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { requirePermission } from '$lib/server/auth';
import { RESOURCE_MAP } from '$lib/server/cms/resources';
import {
	deleteRow,
	duplicateRow,
	getRow,
	listRevisions,
	mediaFor,
	parseForm,
	publishChecks,
	relationOptions,
	restoreRevision,
	rowToForm,
	saveRow,
	toMeta
} from '$lib/server/cms/engine';

function resolve(key: string) {
	const def = RESOURCE_MAP.get(key);
	if (!def) error(404, 'Sección no encontrada');
	return def;
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const def = resolve(params.resource);
	const user = requirePermission(locals.user, def.module, 'read');
	const isNew = params.id === 'nuevo';
	let row: Record<string, unknown> | null = null;
	if (!isNew) {
		row = await getRow(locals.db, def, params.id);
		if (!row) error(404, 'Registro no encontrado');
	}
	const source = row ?? { ...(def.defaults ?? {}) };
	const [relations, media, revisions] = await Promise.all([
		relationOptions(locals.db, def),
		mediaFor(locals.db, def, [source]),
		isNew ? [] : listRevisions(locals.db, def, params.id)
	]);
	return {
		meta: toMeta(def, user),
		isNew,
		id: isNew ? null : params.id,
		values: rowToForm(def, source),
		updatedAt: row?.updatedAt ?? null,
		publicUrl: row && def.publicPath && row.status === 'published' ? def.publicPath(row) : null,
		relations,
		media,
		revisions
	};
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const def = resolve(params.resource);
		const user = requirePermission(locals.user, def.module, 'write');
		const form = await request.formData();
		const { values, errors } = parseForm(def, form);
		Object.assign(errors, await publishChecks(locals.db, def, values));
		if (Object.keys(errors).length) {
			return fail(400, { errors, submitted: Object.fromEntries([...form.keys()].map((k) => [k, form.getAll(k).length > 1 ? form.getAll(k) : form.get(k)])) });
		}
		const id = params.id === 'nuevo' ? null : params.id;
		const result = await saveRow(locals.db, def, id, values, user);
		if (result.error) return fail(400, { errors: result.error as unknown as Record<string, string>, submitted: Object.fromEntries(form) });
		const intent = form.get('intent');
		if (intent === 'save-new') redirect(303, `/admin/c/${def.key}/nuevo?ok=guardado`);
		if (intent === 'save-close') redirect(303, `/admin/c/${def.key}?ok=guardado`);
		redirect(303, `/admin/c/${def.key}/${result.id}?ok=guardado`);
	},
	delete: async ({ locals, params }) => {
		const def = resolve(params.resource);
		const user = requirePermission(locals.user, def.module, 'write');
		await deleteRow(locals.db, def, params.id, user);
		redirect(303, `/admin/c/${def.key}?ok=eliminado`);
	},
	duplicate: async ({ locals, params }) => {
		const def = resolve(params.resource);
		const user = requirePermission(locals.user, def.module, 'write');
		const newId = await duplicateRow(locals.db, def, params.id, user);
		if (!newId) return fail(404, { errors: { _form: 'No encontrado' } });
		redirect(303, `/admin/c/${def.key}/${newId}?ok=duplicado`);
	},
	restore: async ({ locals, params, request }) => {
		const def = resolve(params.resource);
		const user = requirePermission(locals.user, def.module, 'write');
		const revisionId = String((await request.formData()).get('revision'));
		const ok = await restoreRevision(locals.db, def, params.id, revisionId, user);
		if (!ok) return fail(404, { errors: { _form: 'Revisión no encontrada' } });
		redirect(303, `/admin/c/${def.key}/${params.id}?ok=restaurado`);
	}
};
