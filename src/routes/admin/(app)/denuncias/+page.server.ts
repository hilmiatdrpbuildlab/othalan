import type { PageServerLoad } from './$types';
import { and, desc, eq, ilike, type SQL } from 'drizzle-orm';
import { requirePermission } from '$lib/server/auth';
import { whistleblowerReports } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	requirePermission(locals.user, 'reports', 'read');
	const status = url.searchParams.get('estado') ?? '';
	const q = (url.searchParams.get('q') ?? '').replace(/[%_]/g, '').trim();
	const conds: SQL[] = [];
	if (status) conds.push(eq(whistleblowerReports.status, status as 'recibida'));
	if (q) conds.push(ilike(whistleblowerReports.folio, `%${q}%`));
	const rows = await locals.db
		.select()
		.from(whistleblowerReports)
		.where(conds.length ? and(...conds) : undefined)
		.orderBy(desc(whistleblowerReports.createdAt))
		.limit(300);
	return {
		rows: rows.map((r) => ({ id: r.id, status: r.status, createdAt: r.createdAt, primary: r.folio, secondary: r.category, extra: r.anonymous ? 'Anónima' : 'Identificada' })),
		status,
		q
	};
};
