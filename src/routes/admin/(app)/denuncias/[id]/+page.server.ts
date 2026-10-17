import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requirePermission } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { reportStatusEnum, whistleblowerReports } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requirePermission(locals.user, 'reports', 'read');
	const [r] = await locals.db.select().from(whistleblowerReports).where(eq(whistleblowerReports.id, params.id)).limit(1);
	if (!r) error(404, 'Denuncia no encontrada');
	await audit(locals.db, user, 'export', 'denuncias', r.id, `Lectura de ${r.folio}`);
	return { r, canWrite: true };
};

export const actions: Actions = {
	status: async ({ locals, params, request }) => {
		const user = requirePermission(locals.user, 'reports', 'write');
		const form = await request.formData();
		const status = String(form.get('status'));
		if ((reportStatusEnum.enumValues as string[]).includes(status)) {
			await locals.db
				.update(whistleblowerReports)
				.set({ status: status as 'recibida', notes: String(form.get('notes') ?? '').slice(0, 8000) || null })
				.where(eq(whistleblowerReports.id, params.id));
			await audit(locals.db, user, 'status', 'denuncias', params.id, status);
		}
		redirect(303, `/admin/denuncias/${params.id}?ok=guardado`);
	},
	erase: async ({ locals, params }) => {
		const user = requirePermission(locals.user, 'reports', 'write');
		await locals.db.delete(whistleblowerReports).where(eq(whistleblowerReports.id, params.id));
		await audit(locals.db, user, 'delete', 'denuncias', params.id, 'Denuncia eliminada');
		redirect(303, '/admin/denuncias?ok=eliminado');
	}
};
