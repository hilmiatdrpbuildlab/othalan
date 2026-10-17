import type { PageServerLoad } from './$types';
import { getCertifications, getLatestSafety, getPage } from '$lib/server/content';
import { renderMarkdown } from '$lib/server/markdown';

export const load: PageServerLoad = async ({ locals }) => {
	const [page, certifications, safety] = await Promise.all([
		getPage(locals.db, 'seguridad-y-calidad'),
		getCertifications(locals.db),
		getLatestSafety(locals.db)
	]);
	return { page, bodyHtml: renderMarkdown(page?.body), certifications, safety };
};
