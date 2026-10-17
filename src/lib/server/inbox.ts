import { and, eq, gte, ilike, or, type SQL } from 'drizzle-orm';
import { rfqRequests, rfqStatusEnum } from './db/schema';
import { santiagoLocalToDate } from './cms/engine';

/** Shared RFQ list/CSV filters from the query string. */
export function rfqFilters(url: URL) {
	const conds: SQL[] = [];
	const status = url.searchParams.get('estado') ?? '';
	const service = url.searchParams.get('servicio') ?? '';
	const region = url.searchParams.get('region') ?? '';
	const desde = url.searchParams.get('desde') ?? '';
	const q = (url.searchParams.get('q') ?? '').replace(/[%_]/g, '').trim();
	if (status && (rfqStatusEnum.enumValues as string[]).includes(status)) conds.push(eq(rfqRequests.status, status as 'nueva'));
	if (service) conds.push(eq(rfqRequests.serviceId, service));
	if (region) conds.push(eq(rfqRequests.region, region));
	if (/^\d{4}-\d{2}-\d{2}$/.test(desde)) conds.push(gte(rfqRequests.createdAt, santiagoLocalToDate(`${desde}T00:00`)));
	if (q) {
		conds.push(
			or(
				ilike(rfqRequests.ticketCode, `%${q}%`),
				ilike(rfqRequests.contactName, `%${q}%`),
				ilike(rfqRequests.company, `%${q}%`),
				ilike(rfqRequests.email, `%${q}%`)
			)!
		);
	}
	return { where: conds.length ? and(...conds) : undefined, filters: { status, service, region, desde, q } };
}

