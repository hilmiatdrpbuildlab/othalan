import type { PageServerLoad } from './$types';
import {
	getCertifications,
	getClients,
	getHomeSections,
	getLatestSafety,
	getMediaMap,
	getServices,
	getStats,
	getTeam,
	getTestimonials,
	homeData,
	listProjects
} from '$lib/server/content';

export const load: PageServerLoad = async ({ locals }) => {
	const db = locals.db;
	const sections = await getHomeSections(db);
	const on = (k: string) => sections.some((s) => s.key === k && s.enabled);

	const [services, projects, team, clients, testimonials, stats, certifications, safety] = await Promise.all([
		on('services') ? getServices(db) : [],
		on('projects') ? listProjects(db, { perPage: 5 }).then((r) => r.items) : [],
		on('team') ? getTeam(db, { homeOnly: true }) : [],
		on('clients') ? getClients(db, true) : [],
		on('testimonials') ? getTestimonials(db) : [],
		getStats(db),
		on('safety') ? getCertifications(db) : [],
		on('safety') ? getLatestSafety(db) : null
	]);

	const hero = homeData(sections, 'hero');
	const why = homeData(sections, 'why');
	const media = await getMediaMap(db, [hero?.data.imageId, why?.data.imageId]);

	return {
		sections,
		heroImage: media.get(hero?.data.imageId ?? '') ?? null,
		whyImage: media.get(why?.data.imageId ?? '') ?? null,
		services,
		projects,
		team,
		clients: clients.filter((c) => c.logo),
		testimonials,
		stats,
		certifications,
		safety
	};
};
