import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getProject, listProjects } from '$lib/server/content';
import { renderMarkdown } from '$lib/server/markdown';

export const load: PageServerLoad = async ({ locals, params }) => {
	const project = await getProject(locals.db, params.slug);
	if (!project) error(404, 'Proyecto no encontrado');
	const more = await listProjects(locals.db, { perPage: 3, excludeId: project.id, category: project.categorySlug });
	const fallback = more.items.length ? more : await listProjects(locals.db, { perPage: 3, excludeId: project.id });
	return {
		project,
		html: {
			challenge: renderMarkdown(project.challenge),
			solution: renderMarkdown(project.solution),
			result: renderMarkdown(project.result)
		},
		related: fallback.items
	};
};
