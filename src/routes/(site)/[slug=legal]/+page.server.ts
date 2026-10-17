import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPage } from '$lib/server/content';
import { renderMarkdown } from '$lib/server/markdown';

export const load: PageServerLoad = async ({ locals, params }) => {
	const page = await getPage(locals.db, params.slug);
	if (!page) error(404, 'Página no encontrada');
	return { page, bodyHtml: renderMarkdown(page.body) };
};
