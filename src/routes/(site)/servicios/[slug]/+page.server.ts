import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getFaqs, getService, getServices, listProjects } from '$lib/server/content';
import { renderMarkdown } from '$lib/server/markdown';

export const load: PageServerLoad = async ({ locals, params }) => {
	const service = await getService(locals.db, params.slug);
	if (!service) error(404, 'Servicio no encontrado');
	const [projects, others, faqs] = await Promise.all([
		listProjects(locals.db, { serviceId: service.id, perPage: 3 }),
		getServices(locals.db),
		getFaqs(locals.db)
	]);
	return {
		service,
		bodyHtml: renderMarkdown(service.body),
		projects: projects.items,
		others: others.filter((s) => s.id !== service.id),
		faqs: faqs.filter((f) => f.category === 'Servicios' || f.category === 'Cotizaciones').slice(0, 4)
	};
};
