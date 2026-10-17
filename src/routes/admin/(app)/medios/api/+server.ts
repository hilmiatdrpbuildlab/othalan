import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { and, desc, ilike, like, or, type SQL } from 'drizzle-orm';
import { requirePermission } from '$lib/server/auth';
import { media } from '$lib/server/db/schema';

/** JSON list for the media picker. */
export const GET: RequestHandler = async ({ locals, url }) => {
	requirePermission(locals.user, 'media', 'read');
	const tipo = url.searchParams.get('tipo');
	const q = (url.searchParams.get('q') ?? '').replace(/[%_]/g, '').trim();
	const conds: SQL[] = [];
	if (tipo === 'image') conds.push(like(media.mime, 'image/%'));
	if (q) conds.push(or(ilike(media.filename, `%${q}%`), ilike(media.alt, `%${q}%`))!);
	const rows = await locals.db
		.select({
			id: media.id,
			storageKey: media.storageKey,
			mime: media.mime,
			filename: media.filename,
			alt: media.alt,
			width: media.width,
			height: media.height,
			bytes: media.bytes,
			dominantColor: media.dominantColor
		})
		.from(media)
		.where(conds.length ? and(...conds) : undefined)
		.orderBy(desc(media.createdAt))
		.limit(120);
	return json(rows);
};
