import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { count, eq } from 'drizzle-orm';
import { can, ROLE_LABELS } from '$lib/server/auth';
import { RESOURCES } from '$lib/server/cms/resources';
import { applicationStatusEnum, contactMessages, jobApplications, rfqRequests, supplierRegistrations, whistleblowerReports } from '$lib/server/db/schema';

export type NavItem = { href: string; label: string; icon: string; badge?: number };
export type NavGroup = { label: string; items: NavItem[] };

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = locals.user;
	if (!user) redirect(303, `/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`);
	const db = locals.db;

	const n = async (q: Promise<{ n: number }[]>) => Number((await q)[0]?.n ?? 0);
	const [rfq, msgs, apps, sup, rep] = await Promise.all([
		can(user, 'leads') ? n(db.select({ n: count() }).from(rfqRequests).where(eq(rfqRequests.status, 'nueva'))) : 0,
		can(user, 'leads') ? n(db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.status, 'nuevo'))) : 0,
		can(user, 'applications')
			? n(db.select({ n: count() }).from(jobApplications).where(eq(jobApplications.status, applicationStatusEnum.enumValues[0])))
			: 0,
		can(user, 'suppliers') ? n(db.select({ n: count() }).from(supplierRegistrations).where(eq(supplierRegistrations.status, 'nuevo'))) : 0,
		can(user, 'reports') ? n(db.select({ n: count() }).from(whistleblowerReports).where(eq(whistleblowerReports.status, 'recibida'))) : 0
	]);

	const groups: NavGroup[] = [];
	groups.push({ label: '', items: [{ href: '/admin', label: 'Panel', icon: 'layout-dashboard' }] });

	const inbox: NavItem[] = [];
	if (can(user, 'leads')) {
		inbox.push({ href: '/admin/cotizaciones', label: 'Cotizaciones', icon: 'clipboard-list', badge: rfq });
		inbox.push({ href: '/admin/mensajes', label: 'Mensajes', icon: 'message', badge: msgs });
	}
	if (can(user, 'applications')) inbox.push({ href: '/admin/postulaciones', label: 'Postulaciones', icon: 'id-badge-2', badge: apps });
	if (can(user, 'suppliers')) inbox.push({ href: '/admin/proveedores', label: 'Proveedores', icon: 'truck-delivery', badge: sup });
	if (can(user, 'reports')) inbox.push({ href: '/admin/denuncias', label: 'Denuncias', icon: 'lock', badge: rep });
	if (inbox.length) groups.push({ label: 'Bandeja', items: inbox });

	if (can(user, 'content')) {
		groups.push({
			label: 'Sitio',
			items: [
				{ href: '/admin/inicio', label: 'Página de inicio', icon: 'home' },
				{ href: '/admin/medios', label: 'Medios', icon: 'photo' }
			]
		});
	}
	for (const group of ['Contenido', 'Empresa', 'Confianza', 'Empleo']) {
		const items = RESOURCES.filter((r) => r.group === group && can(user, r.module)).map((r) => ({
			href: `/admin/c/${r.key}`,
			label: r.label,
			icon: r.icon
		}));
		if (items.length) groups.push({ label: group, items });
	}
	if (can(user, 'settings')) {
		groups.push({
			label: 'Administración',
			items: [
				{ href: '/admin/configuracion', label: 'Configuración', icon: 'settings' },
				{ href: '/admin/c/redirecciones', label: 'Redirecciones', icon: 'route' },
				{ href: '/admin/usuarios', label: 'Usuarios', icon: 'users-group' },
				{ href: '/admin/auditoria', label: 'Auditoría', icon: 'history' }
			]
		});
	}

	return { user, roleLabel: ROLE_LABELS[user.role], nav: groups };
};
