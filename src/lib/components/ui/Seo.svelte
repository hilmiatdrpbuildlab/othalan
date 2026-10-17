<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import { mediaUrl } from '$lib/utils/image';
	import { stripHighlight } from '$lib/utils/highlight';

	type Props = {
		title?: string | null;
		description?: string | null;
		imageKey?: string | null;
		noindex?: boolean;
		type?: 'website' | 'article';
		jsonLd?: Record<string, unknown> | Record<string, unknown>[] | null;
	};
	let { title, description, imageKey, noindex = false, type = 'website', jsonLd }: Props = $props();

	const settings = $derived(page.data.settings);
	const site = $derived((env.PUBLIC_SITE_URL || page.url.origin).replace(/\/$/, ''));
	const fullTitle = $derived(
		title ? `${stripHighlight(title)} | ${settings?.companyName ?? 'Othalan'}` : (settings?.seo.defaultTitle ?? 'Othalan')
	);
	const desc = $derived((description ?? settings?.seo.defaultDescription ?? '').slice(0, 160));
	const canonical = $derived(site + page.url.pathname);
	const ogKey = $derived(imageKey ?? page.data.defaultOgKey ?? null);
	const image = $derived(ogKey ? site + mediaUrl(ogKey, { w: 1200 }) : `${site}/icon-512.png`);
	const ld = $derived(jsonLd ? JSON.stringify(jsonLd).replace(/</g, '\\u003c') : null);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	{#if desc}<meta name="description" content={desc} />{/if}
	<link rel="canonical" href={canonical} />
	{#if noindex}<meta name="robots" content="noindex, nofollow" />{/if}
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={settings?.companyName ?? 'Othalan'} />
	<meta property="og:locale" content="es_CL" />
	<meta property="og:title" content={fullTitle} />
	{#if desc}<meta property="og:description" content={desc} />{/if}
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={image} />
	<meta name="twitter:card" content="summary_large_image" />
	{#if ld}
		{@html `<script type="application/ld+json">${ld}</script>`}
	{/if}
</svelte:head>
