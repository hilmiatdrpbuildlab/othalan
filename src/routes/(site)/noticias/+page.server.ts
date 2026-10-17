import type { PageServerLoad } from './$types';
import { listPosts } from '$lib/server/content';

export const load: PageServerLoad = async ({ locals, url }) => {
	const page = Math.max(1, Number(url.searchParams.get('pagina')) || 1);
	return listPosts(locals.db, { page });
};
