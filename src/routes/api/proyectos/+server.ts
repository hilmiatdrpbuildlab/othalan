import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { listProjects } from '$lib/server/content';

/** JSON page of published projects for the "Cargar más" button. */
export const GET: RequestHandler = async ({ locals, url }) => {
	const page = Math.max(1, Number(url.searchParams.get('pagina')) || 1);
	const result = await listProjects(locals.db, { category: url.searchParams.get('categoria'), page });
	return json(result, { headers: { 'cache-control': 'public, max-age=60' } });
};
