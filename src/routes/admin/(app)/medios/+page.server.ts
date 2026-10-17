import type { PageServerLoad } from './$types';
import { and, count, desc, eq, ilike, like, or, type SQL } from 'drizzle-orm';
import { can, requirePermission } from '$lib/server/auth';
import { media } from '$lib/server/db/schema';

const PER_PAGE = 48;

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requirePermission(locals.user, 'media', 'read');
	const q = (url.searchParams.get('q') ?? '').replace(/[%_]/g, '').trim();
	const folder = url.searchParams.get('carpeta') ?? '';
	const tipo = url.searchParams.get('tipo') ?? '';
	const sinAlt = url.searchParams.get('sin_alt') === '1';
	const page = Math.max(1, Number(url.searchParams.get('pagina')) || 1);
	const conds: SQL[] = [];
	if (q) conds.push(or(ilike(media.filename, `%${q}%`), ilike(media.alt, `%${q}%`))!);
	if (folder) conds.push(eq(media.folder, folder));
	if (tipo === 'image') conds.push(like(media.mime, 'image/%'));
	if (tipo === 'pdf') conds.push(eq(media.mime, 'application/pdf'));
	if (sinAlt) conds.push(and(eq(media.alt, ''), like(media.mime, 'image/%'))!);
	const where = conds.length ? and(...conds) : undefined;
	const [items, [{ total }], folders] = await Promise.all([
		locals.db.select().from(media).where(where).orderBy(desc(media.createdAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
		locals.db.select({ total: count() }).from(media).where(where),
		locals.db.selectDistinct({ folder: media.folder }).from(media).orderBy(media.folder)
	]);
	return {
		items,
		total,
		page,
		pages: Math.max(1, Math.ceil(total / PER_PAGE)),
		folders: folders.map((f) => f.folder),
		filters: { q, folder, tipo, sinAlt },
		canWrite: can(user, 'media', 'write')
	};
};
