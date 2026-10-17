import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { can, requirePermission } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { inboxStatusEnum, supplierRegistrations } from '$lib/server/db/schema';
import { getStorage } from '$lib/server/storage';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requirePermission(locals.user, 'suppliers', 'read');
	const [s] = await locals.db.select().from(supplierRegistrations).where(eq(supplierRegistrations.id, params.id)).limit(1);
	if (!s) error(404, 'Registro no encontrado');
	const canWrite = can(user, 'suppliers', 'write');
	if (s.status === 'nuevo' && canWrite) {
		await locals.db.update(supplierRegistrations).set({ status: 'leido' }).where(eq(supplierRegistrations.id, s.id));
		s.status = 'leido';
	}
	return { s, canWrite };
};

export const actions: Actions = {
	status: async ({ locals, params, request }) => {
		const user = requirePermission(locals.user, 'suppliers', 'write');
		const status = String((await request.formData()).get('status'));
		if ((inboxStatusEnum.enumValues as string[]).includes(status)) {
			await locals.db.update(supplierRegistrations).set({ status: status as 'nuevo' }).where(eq(supplierRegistrations.id, params.id));
			await audit(locals.db, user, 'status', 'proveedores', params.id, status);
		}
		redirect(303, `/admin/proveedores/${params.id}?ok=guardado`);
	},
	erase: async ({ locals, params }) => {
		const user = requirePermission(locals.user, 'suppliers', 'write');
		const [row] = await locals.db.delete(supplierRegistrations).where(eq(supplierRegistrations.id, params.id)).returning();
		if (row?.fileKey) await getStorage(env).delete(row.fileKey).catch(() => {});
		await audit(locals.db, user, 'delete', 'proveedores', params.id, 'Datos eliminados');
		redirect(303, '/admin/proveedores?ok=eliminado');
	}
};
