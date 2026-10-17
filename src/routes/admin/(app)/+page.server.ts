import type { PageServerLoad } from './$types';
import { and, count, desc, eq, gte, isNotNull, lte, sql } from 'drizzle-orm';
import { can, requirePermission } from '$lib/server/auth';
import { getSettings } from '$lib/server/content';
import * as t from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requirePermission(locals.user, 'dashboard');
	const db = locals.db;
	const weekAgo = new Date(Date.now() - 7 * 864e5);
	const n = async (q: Promise<{ n: number }[]>) => Number((await q)[0]?.n ?? 0);
	const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);

	const leads = can(user, 'leads');
	const content = can(user, 'content');
	const [rfqWeek, rfqNew, msgNew, appsNew, drafts, recentRfq, activity, expiring, publishedProjects, filledStats, settings] = await Promise.all([
		leads ? n(db.select({ n: count() }).from(t.rfqRequests).where(gte(t.rfqRequests.createdAt, weekAgo))) : 0,
		leads ? n(db.select({ n: count() }).from(t.rfqRequests).where(eq(t.rfqRequests.status, 'nueva'))) : 0,
		leads ? n(db.select({ n: count() }).from(t.contactMessages).where(eq(t.contactMessages.status, 'nuevo'))) : 0,
		can(user, 'applications') ? n(db.select({ n: count() }).from(t.jobApplications).where(eq(t.jobApplications.status, 'recibida'))) : 0,
		content
			? Promise.all([
					n(db.select({ n: count() }).from(t.projects).where(eq(t.projects.status, 'draft'))),
					n(db.select({ n: count() }).from(t.services).where(eq(t.services.status, 'draft'))),
					n(db.select({ n: count() }).from(t.posts).where(eq(t.posts.status, 'draft')))
				]).then((x) => x.reduce((a, b) => a + b, 0))
			: 0,
		leads
			? db
					.select({ id: t.rfqRequests.id, ticketCode: t.rfqRequests.ticketCode, contactName: t.rfqRequests.contactName, company: t.rfqRequests.company, serviceLabel: t.rfqRequests.serviceLabel, status: t.rfqRequests.status, createdAt: t.rfqRequests.createdAt })
					.from(t.rfqRequests)
					.orderBy(desc(t.rfqRequests.createdAt))
					.limit(6)
			: [],
		can(user, 'audit') ? db.select().from(t.auditLog).orderBy(desc(t.auditLog.createdAt)).limit(8) : [],
		content
			? db
					.select({ id: t.certifications.id, name: t.certifications.name, expiresAt: t.certifications.expiresAt })
					.from(t.certifications)
					.where(and(isNotNull(t.certifications.expiresAt), lte(t.certifications.expiresAt, in30)))
			: [],
		content ? n(db.select({ n: count() }).from(t.projects).where(eq(t.projects.status, 'published'))) : 0,
		content ? n(db.select({ n: count() }).from(t.stats).where(sql`${t.stats.value} > 0`)) : 0,
		getSettings(db)
	]);

	// Launch checklist (execution_plan §4.2 / §14.1)
	const checklist = content
		? [
				{ ok: publishedProjects >= 6, label: `Publicar proyectos con ficha técnica (${publishedProjects} publicados, meta ≥ 12)`, href: '/admin/c/proyectos' },
				{ ok: filledStats > 0, label: 'Completar estadísticas de la empresa (se ocultan si están vacías)', href: '/admin/c/estadisticas' },
				{ ok: !!settings.phone && !!settings.whatsapp, label: 'Teléfono y WhatsApp de contacto', href: '/admin/configuracion' },
				{ ok: !!settings.rut, label: 'RUT y razón social de la empresa', href: '/admin/configuracion' },
				{ ok: !!settings.address, label: 'Dirección de oficina / taller', href: '/admin/configuracion' },
				{ ok: !!settings.notify.rfq || !!settings.email, label: 'Correo que recibe las cotizaciones', href: '/admin/configuracion' }
			]
		: [];

	return { rfqWeek, rfqNew, msgNew, appsNew, drafts, recentRfq, activity, expiring, checklist };
};
