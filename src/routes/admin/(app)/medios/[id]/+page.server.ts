import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { can, requirePermission } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import type { DB } from '$lib/server/db/client';
import * as t from '$lib/server/db/schema';
import { getStorage } from '$lib/server/storage';

/** Where is this media used? (prevents deleting images that are on the site) */
async function usage(db: DB, id: string) {
	const json = JSON.stringify([{ mediaId: id }]);
	const checks: [string, string, Promise<{ id: string; label: string }[]>][] = [
		['Servicios', 'servicios', db.select({ id: t.services.id, label: t.services.title }).from(t.services).where(eq(t.services.coverMediaId, id))],
		['Proyectos (portada)', 'proyectos', db.select({ id: t.projects.id, label: t.projects.title }).from(t.projects).where(eq(t.projects.coverMediaId, id))],
		['Proyectos (galería)', 'proyectos', db.select({ id: t.projects.id, label: t.projects.title }).from(t.projects).where(sql`${t.projects.gallery} @> ${json}::jsonb`)],
		['Equipo', 'equipo', db.select({ id: t.teamMembers.id, label: t.teamMembers.name }).from(t.teamMembers).where(eq(t.teamMembers.photoMediaId, id))],
		['Clientes', 'clientes', db.select({ id: t.clients.id, label: t.clients.name }).from(t.clients).where(eq(t.clients.logoMediaId, id))],
		['Certificaciones', 'certificaciones', db.select({ id: t.certifications.id, label: t.certifications.name }).from(t.certifications).where(sql`${t.certifications.logoMediaId} = ${id} or ${t.certifications.fileMediaId} = ${id}`)],
		['Descargas', 'descargas', db.select({ id: t.downloads.id, label: t.downloads.title }).from(t.downloads).where(eq(t.downloads.fileMediaId, id))],
		['Páginas', 'paginas', db.select({ id: t.pages.id, label: t.pages.title }).from(t.pages).where(eq(t.pages.coverMediaId, id))],
		['Noticias', 'noticias', db.select({ id: t.posts.id, label: t.posts.title }).from(t.posts).where(eq(t.posts.coverMediaId, id))],
		['Maquinaria', 'maquinaria', db.select({ id: t.equipment.id, label: t.equipment.name }).from(t.equipment).where(eq(t.equipment.photoMediaId, id))]
	];
	const results = await Promise.all(checks.map(([, , q]) => q));
	const out: { group: string; href: string; label: string }[] = [];
	results.forEach((rows, i) => rows.forEach((r) => out.push({ group: checks[i][0], href: `/admin/c/${checks[i][1]}/${r.id}`, label: r.label })));
	const [home, settings] = await Promise.all([
		db.select({ key: t.homeSections.key }).from(t.homeSections).where(sql`${t.homeSections.data}::text like ${'%' + id + '%'}`),
		db.select({ key: t.siteSettings.key }).from(t.siteSettings).where(sql`${t.siteSettings.value}::text like ${'%' + id + '%'}`)
	]);
	home.forEach((h) => out.push({ group: 'Página de inicio', href: '/admin/inicio', label: h.key }));
	settings.forEach(() => out.push({ group: 'Configuración', href: '/admin/configuracion', label: 'Logo / imagen para redes' }));
	return out;
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requirePermission(locals.user, 'media', 'read');
	const [item] = await locals.db.select().from(t.media).where(eq(t.media.id, params.id)).limit(1);
	if (!item) error(404, 'Archivo no encontrado');
	return { item, usage: await usage(locals.db, item.id), canWrite: can(user, 'media', 'write') };
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const user = requirePermission(locals.user, 'media', 'write');
		const form = await request.formData();
		const clamp = (v: FormDataEntryValue | null) => Math.min(1, Math.max(0, Number(v) || 0.5));
		await locals.db
			.update(t.media)
			.set({
				alt: String(form.get('alt') ?? '').trim().slice(0, 300),
				caption: String(form.get('caption') ?? '').trim().slice(0, 300) || null,
				credit: String(form.get('credit') ?? '').trim().slice(0, 120) || null,
				folder: String(form.get('folder') ?? 'general').trim().slice(0, 40) || 'general',
				focalX: clamp(form.get('focalX')),
				focalY: clamp(form.get('focalY'))
			})
			.where(eq(t.media.id, params.id));
		await audit(locals.db, user, 'update', 'media', params.id);
		redirect(303, `/admin/medios/${params.id}?ok=guardado`);
	},
	delete: async ({ locals, params }) => {
		const user = requirePermission(locals.user, 'media', 'write');
		const [item] = await locals.db.select().from(t.media).where(eq(t.media.id, params.id)).limit(1);
		if (!item) error(404);
		const used = await usage(locals.db, item.id);
		if (used.length) return fail(400, { error: 'No se puede eliminar: el archivo está en uso. Quítalo primero de los contenidos listados.' });
		await locals.db.delete(t.media).where(eq(t.media.id, item.id));
		await getStorage(env).delete(item.storageKey).catch((e) => console.error('[media] storage delete failed', e));
		await audit(locals.db, user, 'delete', 'media', item.id, item.filename);
		redirect(303, '/admin/medios?ok=eliminado');
	}
};
