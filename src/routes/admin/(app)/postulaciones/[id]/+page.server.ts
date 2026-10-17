import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { can, requirePermission } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { applicationStatusEnum, jobApplications } from '$lib/server/db/schema';
import { getStorage } from '$lib/server/storage';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requirePermission(locals.user, 'applications', 'read');
	const [app] = await locals.db.select().from(jobApplications).where(eq(jobApplications.id, params.id)).limit(1);
	if (!app) error(404, 'Postulación no encontrada');
	return { app, canWrite: can(user, 'applications', 'write') };
};

export const actions: Actions = {
	status: async ({ locals, params, request }) => {
		const user = requirePermission(locals.user, 'applications', 'write');
		const form = await request.formData();
		const status = String(form.get('status'));
		if ((applicationStatusEnum.enumValues as string[]).includes(status)) {
			await locals.db
				.update(jobApplications)
				.set({ status: status as 'recibida', notes: String(form.get('notes') ?? '').slice(0, 4000) || null })
				.where(eq(jobApplications.id, params.id));
			await audit(locals.db, user, 'status', 'postulaciones', params.id, status);
		}
		redirect(303, `/admin/postulaciones/${params.id}?ok=guardado`);
	},
	erase: async ({ locals, params }) => {
		const user = requirePermission(locals.user, 'applications', 'write');
		const [row] = await locals.db.delete(jobApplications).where(eq(jobApplications.id, params.id)).returning();
		if (row?.cvKey) await getStorage(env).delete(row.cvKey).catch(() => {});
		await audit(locals.db, user, 'delete', 'postulaciones', params.id, 'Datos y CV eliminados');
		redirect(303, '/admin/postulaciones?ok=eliminado');
	}
};
