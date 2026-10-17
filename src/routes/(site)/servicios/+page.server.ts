import type { PageServerLoad } from './$types';
import { getServices } from '$lib/server/content';

export const load: PageServerLoad = async ({ locals }) => ({ services: await getServices(locals.db) });
