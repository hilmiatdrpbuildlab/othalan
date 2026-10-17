import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';
import { and, eq, isNull, lte, or } from 'drizzle-orm';
import { jobOpenings, posts, projects, services } from '$lib/server/db/schema';
import { LEGAL_SLUGS } from '../../params/legal';

const STATIC = [
	'/',
	'/servicios',
	'/proyectos',
	'/nosotros',
	'/nosotros/equipo',
	'/seguridad-y-calidad',
	'/clientes',
	'/cotizacion',
	'/contacto',
	'/trabaja-con-nosotros',
	'/proveedores',
	'/noticias',
	'/descargas',
	'/preguntas-frecuentes',
	'/canal-de-denuncias',
	...LEGAL_SLUGS.map((s) => `/${s}`)
];

export const GET: RequestHandler = async ({ locals, url }) => {
	const site = (env.PUBLIC_SITE_URL || url.origin).replace(/\/$/, '');
	const db = locals.db;
	const now = new Date();
	const [svc, prj, pst, jobs] = await Promise.all([
		db.select({ slug: services.slug, updatedAt: services.updatedAt }).from(services).where(eq(services.status, 'published')),
		db
			.select({ slug: projects.slug, updatedAt: projects.updatedAt })
			.from(projects)
			.where(and(eq(projects.status, 'published'), or(isNull(projects.publishedAt), lte(projects.publishedAt, now)))),
		db
			.select({ slug: posts.slug, updatedAt: posts.updatedAt })
			.from(posts)
			.where(and(eq(posts.status, 'published'), or(isNull(posts.publishedAt), lte(posts.publishedAt, now)))),
		db.select({ slug: jobOpenings.slug, updatedAt: jobOpenings.updatedAt }).from(jobOpenings).where(eq(jobOpenings.status, 'published'))
	]);
	const entry = (path: string, lastmod?: Date) =>
		`<url><loc>${site}${path}</loc>${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`;
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
	...STATIC.map((p) => entry(p)),
	...svc.map((r) => entry(`/servicios/${r.slug}`, r.updatedAt)),
	...prj.map((r) => entry(`/proyectos/${r.slug}`, r.updatedAt)),
	...pst.map((r) => entry(`/noticias/${r.slug}`, r.updatedAt)),
	...jobs.map((r) => entry(`/trabaja-con-nosotros/${r.slug}`, r.updatedAt))
].join('\n')}
</urlset>`;
	return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
};
