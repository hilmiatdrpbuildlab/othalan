import type { PageServerLoad } from './$types';
import { getCertifications, getEquipment, getPage, getStats, getTeam, getTimeline, getValues } from '$lib/server/content';
import { renderMarkdown } from '$lib/server/markdown';

export const load: PageServerLoad = async ({ locals }) => {
	const db = locals.db;
	const [page, team, values, timeline, stats, equipment, certifications] = await Promise.all([
		getPage(db, 'nosotros'),
		getTeam(db),
		getValues(db),
		getTimeline(db),
		getStats(db),
		getEquipment(db),
		getCertifications(db)
	]);
	return {
		page,
		bodyHtml: renderMarkdown(page?.body),
		directivos: team.filter((m) => m.group === 'directivo'),
		otherTeam: team.filter((m) => m.group !== 'directivo'),
		values,
		timeline,
		stats,
		equipment,
		certifications
	};
};
