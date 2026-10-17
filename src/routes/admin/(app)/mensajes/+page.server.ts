import type { PageServerLoad } from './$types';
import { and, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { requirePermission } from '$lib/server/auth';
import { contactMessages } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	requirePermission(locals.user, 'leads', 'read');
	const status = url.searchParams.get('estado') ?? '';
	const q = (url.searchParams.get('q') ?? '').replace(/[%_]/g, '').trim();
	const conds: SQL[] = [];
	if (status) conds.push(eq(contactMessages.status, status as 'nuevo'));
	if (q) conds.push(or(ilike(contactMessages.name, `%${q}%`), ilike(contactMessages.email, `%${q}%`), ilike(contactMessages.company, `%${q}%`))!);
	const rows = await locals.db
		.select()
		.from(contactMessages)
		.where(conds.length ? and(...conds) : undefined)
		.orderBy(desc(contactMessages.createdAt))
		.limit(200);
	return {
		rows: rows.map((r) => ({ id: r.id, status: r.status, createdAt: r.createdAt, primary: r.name, secondary: r.company ?? r.email, extra: r.subject || r.message })),
		status,
		q
	};
};
