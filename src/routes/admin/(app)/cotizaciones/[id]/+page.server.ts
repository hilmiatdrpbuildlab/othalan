import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { asc, desc, eq, inArray } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { can, requirePermission } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { rfqFiles, rfqNotes, rfqRequests, rfqStatusEnum, users } from '$lib/server/db/schema';
import { getStorage } from '$lib/server/storage';
import { RFQ_STATUS } from '$lib/site-config';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requirePermission(locals.user, 'leads', 'read');
	const [rfq] = await locals.db.select().from(rfqRequests).where(eq(rfqRequests.id, params.id)).limit(1);
	if (!rfq) error(404, 'Solicitud no encontrada');
	const [files, notes, team] = await Promise.all([
		locals.db.select().from(rfqFiles).where(eq(rfqFiles.rfqId, rfq.id)).orderBy(asc(rfqFiles.createdAt)),
		locals.db.select().from(rfqNotes).where(eq(rfqNotes.rfqId, rfq.id)).orderBy(desc(rfqNotes.createdAt)),
		locals.db
			.select({ id: users.id, name: users.name })
			.from(users)
			.where(inArray(users.role, ['admin', 'comercial']))
			.orderBy(asc(users.name))
	]);
	return { rfq, files, notes, team, canWrite: can(user, 'leads', 'write') };
};

export const actions: Actions = {
	update: async ({ locals, params, request }) => {
		const user = requirePermission(locals.user, 'leads', 'write');
		const form = await request.formData();
		const status = String(form.get('status'));
		const assignedTo = String(form.get('assignedTo') ?? '') || null;
		if (!(rfqStatusEnum.enumValues as string[]).includes(status)) return fail(400, { error: 'Estado no válido' });
		const [before] = await locals.db.select({ status: rfqRequests.status }).from(rfqRequests).where(eq(rfqRequests.id, params.id));
		await locals.db
			.update(rfqRequests)
			.set({ status: status as 'nueva', assignedTo })
			.where(eq(rfqRequests.id, params.id));
		if (before && before.status !== status) {
			await locals.db.insert(rfqNotes).values({
				rfqId: params.id,
				userId: user.id,
				authorName: user.name,
				body: `Estado cambiado: ${RFQ_STATUS[before.status]} → ${RFQ_STATUS[status]}`
			});
		}
		await audit(locals.db, user, 'status', 'cotizaciones', params.id, RFQ_STATUS[status]);
		redirect(303, `/admin/cotizaciones/${params.id}?ok=guardado`);
	},
	note: async ({ locals, params, request }) => {
		const user = requirePermission(locals.user, 'leads', 'write');
		const body = String((await request.formData()).get('body') ?? '').trim().slice(0, 4000);
		if (!body) return fail(400, { error: 'Escribe una nota.' });
		await locals.db.insert(rfqNotes).values({ rfqId: params.id, userId: user.id, authorName: user.name, body });
		return { noted: true };
	},
	/** Right to erasure (Ley 21.719): deletes the request, notes and attachments. */
	erase: async ({ locals, params }) => {
		const user = requirePermission(locals.user, 'leads', 'write');
		const files = await locals.db.select().from(rfqFiles).where(eq(rfqFiles.rfqId, params.id));
		const storage = getStorage(env);
		await Promise.all(files.map((f) => storage.delete(f.storageKey).catch(() => {})));
		const [row] = await locals.db.delete(rfqRequests).where(eq(rfqRequests.id, params.id)).returning({ ticket: rfqRequests.ticketCode });
		await audit(locals.db, user, 'delete', 'cotizaciones', params.id, `Datos eliminados ${row?.ticket ?? ''}`);
		redirect(303, '/admin/cotizaciones?ok=eliminado');
	}
};
