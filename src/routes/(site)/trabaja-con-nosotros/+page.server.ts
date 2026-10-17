import type { PageServerLoad } from './$types';
import { listJobs } from '$lib/server/content';

export const load: PageServerLoad = async ({ locals }) => ({ jobs: await listJobs(locals.db) });
