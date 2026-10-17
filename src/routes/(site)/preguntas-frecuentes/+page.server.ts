import type { PageServerLoad } from './$types';
import { getFaqs } from '$lib/server/content';

export const load: PageServerLoad = async ({ locals }) => ({ faqs: await getFaqs(locals.db) });
