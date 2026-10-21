import { env } from '$env/dynamic/public';

/** Canonical public origin (no trailing slash). Falls back to the request origin in dev/preview. */
export function siteOrigin(fallback: string): string {
	return (env.PUBLIC_SITE_URL || fallback).replace(/\/$/, '');
}
