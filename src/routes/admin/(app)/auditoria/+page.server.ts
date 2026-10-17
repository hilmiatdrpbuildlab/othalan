import type { PageServerLoad } from './$types';
import { and, count, desc, eq, ilike, type SQL } from 'drizzle-orm';
import { requirePermission } from '$lib/server/auth';
import { auditLog } from '$lib/server/db/schema';

const PER_PAGE = 50;

export const load: PageServerLoad = async ({ locals, url }) => {
	requirePermission(locals.user, 'audit', 'read');
	const entity = url.searchParams.get('entidad') ?? '';
	const q = (url.searchParams.get('q') ?? '').replace(/[%_]/g, '').trim();
	const page = Math.max(1, Number(url.searchParams.get('pagina')) || 1);
	const conds: SQL[] = [];
	if (entity) conds.push(eq(auditLog.entity, entity));
	if (q) conds.push(ilike(auditLog.userName, `%${q}%`));
	const where = conds.length ? and(...conds) : undefined;
	const [rows, [{ total }], entities] = await Promise.all([
		locals.db.select().from(auditLog).where(where).orderBy(desc(auditLog.createdAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
		locals.db.select({ total: count() }).from(auditLog).where(where),
		locals.db.selectDistinct({ entity: auditLog.entity }).from(auditLog).orderBy(auditLog.entity)
	]);
	return { rows, total, page, pages: Math.max(1, Math.ceil(total / PER_PAGE)), entities: entities.map((e) => e.entity), entity, q };
};
