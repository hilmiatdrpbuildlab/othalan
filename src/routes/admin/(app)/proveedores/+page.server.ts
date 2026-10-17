import type { PageServerLoad } from './$types';
import { and, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { requirePermission } from '$lib/server/auth';
import { supplierRegistrations } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	requirePermission(locals.user, 'suppliers', 'read');
	const status = url.searchParams.get('estado') ?? '';
	const q = (url.searchParams.get('q') ?? '').replace(/[%_]/g, '').trim();
	const conds: SQL[] = [];
	if (status) conds.push(eq(supplierRegistrations.status, status as 'nuevo'));
	if (q) conds.push(or(ilike(supplierRegistrations.companyName, `%${q}%`), ilike(supplierRegistrations.category, `%${q}%`), ilike(supplierRegistrations.rut, `%${q}%`))!);
	const rows = await locals.db
		.select()
		.from(supplierRegistrations)
		.where(conds.length ? and(...conds) : undefined)
		.orderBy(desc(supplierRegistrations.createdAt))
		.limit(300);
	return {
		rows: rows.map((r) => ({ id: r.id, status: r.status, createdAt: r.createdAt, primary: r.companyName, secondary: r.category, extra: r.region })),
		status,
		q
	};
};
