import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getStorage } from '$lib/server/storage';

/**
 * Public media delivery: /media/2026/10/<uuid>.webp → storage key public/media/2026/10/<uuid>.webp.
 * Object names are random UUIDs and never reused, so responses are cached for a year (immutable).
 * Only the public/ prefix is reachable here; private files go through /admin/archivos.
 */
export const GET: RequestHandler = async ({ params, request }) => {
	const key = `public/media/${params.key}`;
	if (key.includes('..')) error(400, 'Ruta inválida');
	const obj = await getStorage(env).get(key);
	if (!obj) error(404, 'Archivo no encontrado');

	if (obj.etag && request.headers.get('if-none-match') === obj.etag) {
		return new Response(null, { status: 304 });
	}
	const headers = new Headers({
		'content-type': obj.contentType,
		'cache-control': 'public, max-age=31536000, immutable',
		'x-content-type-options': 'nosniff'
	});
	if (obj.size) headers.set('content-length', String(obj.size));
	if (obj.etag) headers.set('etag', obj.etag);
	// SVGs may contain scripts: neutralise them if opened directly.
	if (obj.contentType.includes('svg')) headers.set('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
	if (obj.contentType === 'application/pdf') headers.set('content-disposition', 'inline');
	return new Response(obj.body as BodyInit, { headers });
};
