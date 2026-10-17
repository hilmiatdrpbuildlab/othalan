import type { PageServerLoad } from './$types';
import { count, desc, eq } from 'drizzle-orm';
import { requirePermission } from '$lib/server/auth';
import { rfqRequests, services, users } from '$lib/server/db/schema';
import { rfqFilters } from '$lib/server/inbox';

const PER_PAGE = 30;

export const load: PageServerLoad = async ({ locals, url }) => {
	requirePermission(locals.user, 'leads', 'read');
	const { where, filters } = rfqFilters(url);
	const page = Math.max(1, Number(url.searchParams.get('pagina')) || 1);
	const [rows, [{ total }], svc, counts] = await Promise.all([
		locals.db
			.select({
				id: rfqRequests.id,
				ticketCode: rfqRequests.ticketCode,
				status: rfqRequests.status,
				contactName: rfqRequests.contactName,
				company: rfqRequests.company,
				serviceLabel: rfqRequests.serviceLabel,
				region: rfqRequests.region,
				createdAt: rfqRequests.createdAt,
				assignee: users.name
			})
			.from(rfqRequests)
			.leftJoin(users, eq(users.id, rfqRequests.assignedTo))
			.where(where)
			.orderBy(desc(rfqRequests.createdAt))
			.limit(PER_PAGE)
			.offset((page - 1) * PER_PAGE),
		locals.db.select({ total: count() }).from(rfqRequests).where(where),
		locals.db.select({ id: services.id, title: services.title }).from(services),
		locals.db.select({ status: rfqRequests.status, n: count() }).from(rfqRequests).groupBy(rfqRequests.status)
	]);
	return {
		rows,
		total,
		page,
		pages: Math.max(1, Math.ceil(total / PER_PAGE)),
		services: svc,
		counts: Object.fromEntries(counts.map((c) => [c.status, c.n])),
		filters
	};
};
