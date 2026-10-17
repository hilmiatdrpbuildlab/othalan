import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { can, requirePermission } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { contactMessages, inboxStatusEnum } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requirePermission(locals.user, 'leads', 'read');
	const [msg] = await locals.db.select().from(contactMessages).where(eq(contactMessages.id, params.id)).limit(1);
	if (!msg) error(404, 'Mensaje no encontrado');
	const canWrite = can(user, 'leads', 'write');
	if (msg.status === 'nuevo' && canWrite) {
		await locals.db.update(contactMessages).set({ status: 'leido' }).where(eq(contactMessages.id, msg.id));
		msg.status = 'leido';
	}
	return { msg, canWrite };
};

export const actions: Actions = {
	status: async ({ locals, params, request }) => {
		const user = requirePermission(locals.user, 'leads', 'write');
		const status = String((await request.formData()).get('status'));
		if ((inboxStatusEnum.enumValues as string[]).includes(status)) {
			await locals.db.update(contactMessages).set({ status: status as 'nuevo' }).where(eq(contactMessages.id, params.id));
			await audit(locals.db, user, 'status', 'mensajes', params.id, status);
		}
		redirect(303, `/admin/mensajes/${params.id}?ok=guardado`);
	},
	erase: async ({ locals, params }) => {
		const user = requirePermission(locals.user, 'leads', 'write');
		await locals.db.delete(contactMessages).where(eq(contactMessages.id, params.id));
		await audit(locals.db, user, 'delete', 'mensajes', params.id, 'Datos eliminados');
		redirect(303, '/admin/mensajes?ok=eliminado');
	}
};
