import { and, asc, count, desc, eq, inArray, isNull, lte, ne, or, sql, type Column } from 'drizzle-orm';
import type { DB } from './db/client';
import * as t from './db/schema';
import {
	DEFAULT_HOME,
	HOME_SECTION_ORDER,
	mergeHomeData,
	mergeSettings,
	type HomeSection,
	type HomeSectionKey,
	type SiteSettings
} from '$lib/site-config';

import type { PublicMedia } from '$lib/types';
export type { PublicMedia };

const mediaCols = {
	id: t.media.id,
	storageKey: t.media.storageKey,
	mime: t.media.mime,
	width: t.media.width,
	height: t.media.height,
	alt: t.media.alt,
	caption: t.media.caption,
	focalX: t.media.focalX,
	focalY: t.media.focalY,
	dominantColor: t.media.dominantColor,
	filename: t.media.filename,
	bytes: t.media.bytes
};

export async function getMediaMap(db: DB, ids: (string | null | undefined)[]): Promise<Map<string, PublicMedia>> {
	const unique = [...new Set(ids.filter((x): x is string => !!x))];
	if (!unique.length) return new Map();
	const rows = await db.select(mediaCols).from(t.media).where(inArray(t.media.id, unique));
	return new Map(rows.map((r) => [r.id, r]));
}

export async function getMedia(db: DB, id: string | null | undefined): Promise<PublicMedia | null> {
	if (!id) return null;
	return (await getMediaMap(db, [id])).get(id) ?? null;
}

/** Attach `<field>` media objects for each `<field>Id` property listed. */
async function withMedia<T extends Record<string, unknown>, K extends string>(
	db: DB,
	rows: T[],
	fields: Record<K, keyof T>
): Promise<(T & Record<K, PublicMedia | null>)[]> {
	const ids = rows.flatMap((r) => Object.values(fields).map((f) => r[f as keyof T] as string | null));
	const map = await getMediaMap(db, ids);
	return rows.map((r) => {
		const extra = {} as Record<K, PublicMedia | null>;
		for (const [k, f] of Object.entries(fields) as [K, keyof T][]) extra[k] = map.get(r[f] as string) ?? null;
		return { ...r, ...extra };
	});
}

const isLive = (status: Column, publishedAt?: Column) =>
	publishedAt ? and(eq(status, 'published'), or(isNull(publishedAt), lte(publishedAt, new Date()))) : eq(status, 'published');

/* ─────────── Settings & home ─────────── */

export async function getSettings(db: DB): Promise<SiteSettings> {
	const [row] = await db.select().from(t.siteSettings).where(eq(t.siteSettings.key, 'site')).limit(1);
	return mergeSettings(row?.value);
}

export async function getHomeSections(db: DB): Promise<HomeSection[]> {
	const rows = await db.select().from(t.homeSections);
	const byKey = new Map(rows.map((r) => [r.key, r]));
	return HOME_SECTION_ORDER.map((key, i) => {
		const r = byKey.get(key);
		return {
			key,
			enabled: r?.enabled ?? true,
			sortOrder: r?.sortOrder ?? i,
			data: mergeHomeData(key, r?.data ?? DEFAULT_HOME[key])
		} as HomeSection;
	}).sort((a, b) => (a.key === 'hero' ? -1 : b.key === 'hero' ? 1 : a.sortOrder - b.sortOrder));
}

export function homeData<K extends HomeSectionKey>(sections: HomeSection[], key: K) {
	return sections.find((s) => s.key === key) as HomeSection<K> | undefined;
}

/* ─────────── Services ─────────── */

export async function getServices(db: DB) {
	const rows = await db
		.select()
		.from(t.services)
		.where(eq(t.services.status, 'published'))
		.orderBy(asc(t.services.sortOrder), asc(t.services.title));
	return withMedia(db, rows, { cover: 'coverMediaId' });
}

export async function getService(db: DB, slug: string) {
	const [row] = await db
		.select()
		.from(t.services)
		.where(and(eq(t.services.slug, slug), eq(t.services.status, 'published')))
		.limit(1);
	if (!row) return null;
	return (await withMedia(db, [row], { cover: 'coverMediaId' }))[0];
}

/* ─────────── Projects ─────────── */

export async function getCategories(db: DB) {
	return db.select().from(t.projectCategories).orderBy(asc(t.projectCategories.sortOrder), asc(t.projectCategories.name));
}

const projectListCols = {
	id: t.projects.id,
	slug: t.projects.slug,
	title: t.projects.title,
	code: t.projects.code,
	region: t.projects.region,
	comuna: t.projects.comuna,
	year: t.projects.year,
	areaM2: t.projects.areaM2,
	steelTons: t.projects.steelTons,
	summary: t.projects.summary,
	coverMediaId: t.projects.coverMediaId,
	categoryName: t.projectCategories.name,
	categorySlug: t.projectCategories.slug,
	serviceIds: t.projects.serviceIds
};

export type ProjectListItem = Awaited<ReturnType<typeof listProjects>>['items'][number];

export async function listProjects(
	db: DB,
	opts: { category?: string | null; page?: number; perPage?: number; featured?: boolean; serviceId?: string; excludeId?: string } = {}
) {
	const perPage = opts.perPage ?? 12;
	const page = Math.max(1, opts.page ?? 1);
	const conds = [isLive(t.projects.status, t.projects.publishedAt)];
	if (opts.category) conds.push(eq(t.projectCategories.slug, opts.category));
	if (opts.featured) conds.push(eq(t.projects.featured, true));
	if (opts.serviceId) conds.push(sql`${t.projects.serviceIds} @> ${JSON.stringify([opts.serviceId])}::jsonb`);
	if (opts.excludeId) conds.push(ne(t.projects.id, opts.excludeId));
	const where = and(...conds);

	const [rows, [{ total }]] = await Promise.all([
		db
			.select(projectListCols)
			.from(t.projects)
			.leftJoin(t.projectCategories, eq(t.projectCategories.id, t.projects.categoryId))
			.where(where)
			.orderBy(desc(t.projects.featured), asc(t.projects.sortOrder), desc(t.projects.year), desc(t.projects.createdAt))
			.limit(perPage)
			.offset((page - 1) * perPage),
		db
			.select({ total: count() })
			.from(t.projects)
			.leftJoin(t.projectCategories, eq(t.projectCategories.id, t.projects.categoryId))
			.where(where)
	]);
	const items = await withMedia(db, rows, { cover: 'coverMediaId' });
	return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getProject(db: DB, slug: string) {
	const [row] = await db
		.select({
			project: t.projects,
			categoryName: t.projectCategories.name,
			categorySlug: t.projectCategories.slug,
			clientNameRel: t.clients.name
		})
		.from(t.projects)
		.leftJoin(t.projectCategories, eq(t.projectCategories.id, t.projects.categoryId))
		.leftJoin(t.clients, eq(t.clients.id, t.projects.clientId))
		.where(and(eq(t.projects.slug, slug), isLive(t.projects.status, t.projects.publishedAt)))
		.limit(1);
	if (!row) return null;
	const p = row.project;
	const map = await getMediaMap(db, [p.coverMediaId, ...p.gallery.map((g) => g.mediaId)]);
	const services = p.serviceIds.length
		? await db
				.select({ id: t.services.id, slug: t.services.slug, title: t.services.title })
				.from(t.services)
				.where(and(inArray(t.services.id, p.serviceIds), eq(t.services.status, 'published')))
		: [];
	const { amountClp, showAmount, ...rest } = p;
	return {
		...rest,
		amountClp: showAmount ? amountClp : null,
		categoryName: row.categoryName,
		categorySlug: row.categorySlug,
		client: row.clientNameRel ?? p.clientName,
		cover: p.coverMediaId ? (map.get(p.coverMediaId) ?? null) : null,
		gallery: p.gallery
			.map((g) => ({ media: map.get(g.mediaId), caption: g.caption }))
			.filter((g): g is { media: PublicMedia; caption: string | undefined } => !!g.media),
		services
	};
}

/* ─────────── People & trust ─────────── */

export async function getTeam(db: DB, opts: { homeOnly?: boolean } = {}) {
	const conds = [eq(t.teamMembers.status, 'published')];
	if (opts.homeOnly) conds.push(eq(t.teamMembers.showOnHome, true));
	const rows = await db
		.select()
		.from(t.teamMembers)
		.where(and(...conds))
		.orderBy(asc(t.teamMembers.sortOrder), asc(t.teamMembers.name));
	return withMedia(db, rows, { photo: 'photoMediaId' });
}

export async function getClients(db: DB, featuredOnly = false) {
	const conds = [eq(t.clients.status, 'published')];
	if (featuredOnly) conds.push(eq(t.clients.featured, true));
	const rows = await db
		.select()
		.from(t.clients)
		.where(and(...conds))
		.orderBy(asc(t.clients.sortOrder), asc(t.clients.name));
	return withMedia(db, rows, { logo: 'logoMediaId' });
}

export async function getTestimonials(db: DB) {
	// Only real, consented testimonials are ever shown.
	const rows = await db
		.select({
			id: t.testimonials.id,
			authorName: t.testimonials.authorName,
			authorRole: t.testimonials.authorRole,
			company: t.testimonials.company,
			quote: t.testimonials.quote,
			clientName: t.clients.name,
			logoMediaId: t.clients.logoMediaId
		})
		.from(t.testimonials)
		.leftJoin(t.clients, eq(t.clients.id, t.testimonials.clientId))
		.where(and(eq(t.testimonials.status, 'published'), eq(t.testimonials.consent, true)))
		.orderBy(asc(t.testimonials.sortOrder));
	return withMedia(db, rows, { logo: 'logoMediaId' });
}

export async function getCertifications(db: DB) {
	const rows = await db
		.select()
		.from(t.certifications)
		.where(eq(t.certifications.status, 'published'))
		.orderBy(asc(t.certifications.sortOrder), asc(t.certifications.name));
	return withMedia(db, rows, { logo: 'logoMediaId', file: 'fileMediaId' });
}

export async function getLatestSafety(db: DB) {
	const [row] = await db
		.select()
		.from(t.safetyStats)
		.where(eq(t.safetyStats.status, 'published'))
		.orderBy(desc(t.safetyStats.updatedAt))
		.limit(1);
	return row ?? null;
}

/** Company stats. Empty / zero values are dropped (never show "0"). */
export async function getStats(db: DB) {
	const rows = await db
		.select()
		.from(t.stats)
		.where(eq(t.stats.status, 'published'))
		.orderBy(asc(t.stats.sortOrder));
	return rows.filter((s) => s.value !== null && Number(s.value) > 0);
}

export async function getValues(db: DB) {
	return db.select().from(t.companyValues).orderBy(asc(t.companyValues.sortOrder));
}

export async function getTimeline(db: DB) {
	return db.select().from(t.timelineEvents).orderBy(asc(t.timelineEvents.year), asc(t.timelineEvents.sortOrder));
}

export async function getEquipment(db: DB) {
	const rows = await db
		.select()
		.from(t.equipment)
		.where(eq(t.equipment.status, 'published'))
		.orderBy(asc(t.equipment.sortOrder), asc(t.equipment.name));
	return withMedia(db, rows, { photo: 'photoMediaId' });
}

export async function getOffices(db: DB) {
	return db.select().from(t.offices).where(eq(t.offices.status, 'published')).orderBy(asc(t.offices.sortOrder));
}

/* ─────────── Other content ─────────── */

export async function getPage(db: DB, slug: string) {
	const [row] = await db
		.select()
		.from(t.pages)
		.where(and(eq(t.pages.slug, slug), eq(t.pages.status, 'published')))
		.limit(1);
	if (!row) return null;
	return (await withMedia(db, [row], { cover: 'coverMediaId' }))[0];
}

export async function getFaqs(db: DB) {
	return db
		.select()
		.from(t.faqs)
		.where(eq(t.faqs.status, 'published'))
		.orderBy(asc(t.faqs.category), asc(t.faqs.sortOrder));
}

export async function getDownloads(db: DB) {
	const rows = await db
		.select()
		.from(t.downloads)
		.where(eq(t.downloads.status, 'published'))
		.orderBy(asc(t.downloads.category), asc(t.downloads.sortOrder));
	return (await withMedia(db, rows, { file: 'fileMediaId' })).filter((d) => d.file);
}

export async function listPosts(db: DB, opts: { page?: number; perPage?: number } = {}) {
	const perPage = opts.perPage ?? 9;
	const page = Math.max(1, opts.page ?? 1);
	const where = and(isLive(t.posts.status, t.posts.publishedAt));
	const [rows, [{ total }]] = await Promise.all([
		db
			.select({
				id: t.posts.id,
				slug: t.posts.slug,
				title: t.posts.title,
				excerpt: t.posts.excerpt,
				category: t.posts.category,
				coverMediaId: t.posts.coverMediaId,
				publishedAt: t.posts.publishedAt,
				createdAt: t.posts.createdAt
			})
			.from(t.posts)
			.where(where)
			.orderBy(desc(t.posts.publishedAt), desc(t.posts.createdAt))
			.limit(perPage)
			.offset((page - 1) * perPage),
		db.select({ total: count() }).from(t.posts).where(where)
	]);
	return { items: await withMedia(db, rows, { cover: 'coverMediaId' }), total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getPost(db: DB, slug: string) {
	const [row] = await db
		.select()
		.from(t.posts)
		.where(and(eq(t.posts.slug, slug), isLive(t.posts.status, t.posts.publishedAt)))
		.limit(1);
	if (!row) return null;
	return (await withMedia(db, [row], { cover: 'coverMediaId' }))[0];
}

const openJob = () =>
	and(
		isLive(t.jobOpenings.status, t.jobOpenings.publishedAt),
		or(isNull(t.jobOpenings.closesAt), sql`${t.jobOpenings.closesAt} >= current_date`)
	);

export async function listJobs(db: DB) {
	return db.select().from(t.jobOpenings).where(openJob()).orderBy(desc(t.jobOpenings.publishedAt), desc(t.jobOpenings.createdAt));
}

export async function getJob(db: DB, slug: string) {
	const [row] = await db
		.select()
		.from(t.jobOpenings)
		.where(and(eq(t.jobOpenings.slug, slug), openJob()))
		.limit(1);
	return row ?? null;
}
