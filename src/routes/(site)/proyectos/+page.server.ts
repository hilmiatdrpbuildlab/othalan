import type { PageServerLoad } from './$types';
import { getCategories, listProjects } from '$lib/server/content';

export const load: PageServerLoad = async ({ locals, url }) => {
	const category = url.searchParams.get('categoria');
	const page = Math.max(1, Number(url.searchParams.get('pagina')) || 1);
	const [categories, result] = await Promise.all([getCategories(locals.db), listProjects(locals.db, { category, page })]);
	return { categories, category, ...result };
};
