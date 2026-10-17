import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const GET: RequestHandler = ({ url }) => {
	const site = (env.PUBLIC_SITE_URL || url.origin).replace(/\/$/, '');
	// Preview / workers.dev deployments must never be indexed.
	const isProduction = url.hostname === new URL(site).hostname && !url.hostname.endsWith('workers.dev');
	const body = isProduction
		? `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /cotizacion/gracias\n\nSitemap: ${site}/sitemap.xml\n`
		: 'User-agent: *\nDisallow: /\n';
	return new Response(body, { headers: { 'content-type': 'text/plain', 'cache-control': 'public, max-age=3600' } });
};
