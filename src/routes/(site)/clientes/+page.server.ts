import type { PageServerLoad } from './$types';
import { getClients, getTestimonials } from '$lib/server/content';

export const load: PageServerLoad = async ({ locals }) => {
	const [clients, testimonials] = await Promise.all([getClients(locals.db), getTestimonials(locals.db)]);
	return { clients, testimonials };
};
