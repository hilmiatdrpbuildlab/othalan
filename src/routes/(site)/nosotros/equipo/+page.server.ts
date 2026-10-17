import type { PageServerLoad } from './$types';
import { getTeam } from '$lib/server/content';

export const load: PageServerLoad = async ({ locals }) => ({ team: await getTeam(locals.db) });
