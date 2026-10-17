import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPost } from '$lib/server/content';
import { renderMarkdown } from '$lib/server/markdown';

export const load: PageServerLoad = async ({ locals, params }) => {
	const post = await getPost(locals.db, params.slug);
	if (!post) error(404, 'Noticia no encontrada');
	return { post, bodyHtml: renderMarkdown(post.body) };
};
