import type { PageServerLoad } from './$types';
import { and, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { requirePermission } from '$lib/server/auth';
import { jobApplications } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	requirePermission(locals.user, 'applications', 'read');
	const status = url.searchParams.get('estado') ?? '';
	const q = (url.searchParams.get('q') ?? '').replace(/[%_]/g, '').trim();
	const conds: SQL[] = [];
	if (status) conds.push(eq(jobApplications.status, status as 'recibida'));
	if (q) conds.push(or(ilike(jobApplications.name, `%${q}%`), ilike(jobApplications.email, `%${q}%`), ilike(jobApplications.position, `%${q}%`))!);
	const rows = await locals.db
		.select()
		.from(jobApplications)
		.where(conds.length ? and(...conds) : undefined)
		.orderBy(desc(jobApplications.createdAt))
		.limit(300);
	return {
		rows: rows.map((r) => ({ id: r.id, status: r.status, createdAt: r.createdAt, primary: r.name, secondary: r.position, extra: r.region })),
		status,
		q
	};
};
