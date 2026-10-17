import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/auth';
import { renderMarkdown } from '$lib/server/markdown';

/** Preview for the markdown editor — uses the exact same renderer as the public site. */
export const POST: RequestHandler = async ({ locals, request }) => {
	requirePermission(locals.user, 'content', 'read');
	const source = (await request.text()).slice(0, 100_000);
	return new Response(renderMarkdown(source) || '<p><em>Sin contenido</em></p>', { headers: { 'content-type': 'text/html; charset=utf-8' } });
};
