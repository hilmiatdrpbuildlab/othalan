import type { RequestHandler } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { requirePermission, type Module } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { getStorage } from '$lib/server/storage';

const ACCESS: Record<string, Module> = { rfq: 'leads', cv: 'applications', suppliers: 'suppliers' };

/** Private attachments (RFQ plans, CVs, supplier docs): only through an authenticated, role-checked request. */
export const GET: RequestHandler = async ({ params, locals, url }) => {
	if (!locals.user) redirect(303, `/admin/login?next=${encodeURIComponent(url.pathname)}`);
	const key = `private/${params.key}`;
	const folder = params.key.split('/')[0];
	const module = ACCESS[folder];
	if (!module || key.includes('..')) error(404, 'Archivo no encontrado');
	const user = requirePermission(locals.user, module, 'read');
	const obj = await getStorage(env).get(key);
	if (!obj) error(404, 'Archivo no encontrado');
	await audit(locals.db, user, 'export', `archivo:${folder}`, null, key.split('/').pop());
	const filename = (url.searchParams.get('nombre') || key.split('/').pop() || 'archivo').replace(/["\r\n]/g, '');
	return new Response(obj.body as BodyInit, {
		headers: {
			'content-type': obj.contentType,
			'content-disposition': `attachment; filename="${filename.replace(/[^\x20-\x7e]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
			'cache-control': 'private, no-store',
			'x-content-type-options': 'nosniff'
		}
	});
};
