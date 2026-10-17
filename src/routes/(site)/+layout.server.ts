import type { LayoutServerLoad } from './$types';
import { asc, eq } from 'drizzle-orm';
import { getMediaMap, getSettings } from '$lib/server/content';
import { services } from '$lib/server/db/schema';

export const load: LayoutServerLoad = async ({ locals, setHeaders }) => {
	const db = locals.db;
	const [settings, navServices] = await Promise.all([
		getSettings(db),
		db
			.select({ slug: services.slug, title: services.title, icon: services.icon, summary: services.summary })
			.from(services)
			.where(eq(services.status, 'published'))
			.orderBy(asc(services.sortOrder))
	]);
	const media = await getMediaMap(db, [settings.logoId, settings.seo.ogImageId]);
	setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' });
	return {
		settings,
		navServices,
		logoKey: media.get(settings.logoId)?.storageKey ?? null,
		defaultOgKey: media.get(settings.seo.ogImageId)?.storageKey ?? null
	};
};
