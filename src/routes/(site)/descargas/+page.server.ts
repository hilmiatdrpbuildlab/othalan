import type { PageServerLoad } from './$types';
import { getCertifications, getDownloads } from '$lib/server/content';

export const load: PageServerLoad = async ({ locals }) => {
	const [downloads, certifications] = await Promise.all([getDownloads(locals.db), getCertifications(locals.db)]);
	return { downloads, certFiles: certifications.filter((c) => c.file) };
};
