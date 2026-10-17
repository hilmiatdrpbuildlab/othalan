<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Img from '$lib/components/media/Img.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import CtaBand from '$lib/components/sections/CtaBand.svelte';
	import { formatDateLong } from '$lib/utils/format';
	import { page } from '$app/state';

	let { data } = $props();
	const p = $derived(data.post);
	const date = $derived(p.publishedAt ?? p.createdAt);
	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: p.title,
		datePublished: new Date(date).toISOString(),
		dateModified: new Date(p.updatedAt).toISOString(),
		author: p.authorName ? { '@type': 'Person', name: p.authorName } : { '@type': 'Organization', name: data.settings.legalName },
		publisher: { '@type': 'Organization', name: data.settings.legalName, logo: { '@type': 'ImageObject', url: `${page.url.origin}/icon-512.png` } }
	});
</script>

<Seo title={p.seoTitle || p.title} description={p.seoDescription || p.excerpt} imageKey={p.cover?.storageKey} type="article" {jsonLd} />

<PageHero eyebrow={p.category ?? 'Noticias'} title={p.title} lead={p.excerpt} crumbs={[{ href: '/noticias', label: 'Noticias' }, { label: p.title }]}>
	<p class="caption meta">{formatDateLong(date)}{#if p.authorName}&nbsp;· {p.authorName}{/if}</p>
</PageHero>

<article class="section">
	<div class="container container--narrow">
		{#if p.cover}<div class="cover"><Img media={p.cover} ratio="3/2" priority width={1440} sizes="(min-width:768px) 768px, 100vw" /></div>{/if}
		<div class="prose">{@html data.bodyHtml}</div>
		<p class="back"><a href="/noticias" class="link-arrow">← Volver a noticias</a></p>
	</div>
</article>

<CtaBand title="¿Tienes un proyecto en *mente*?" text="Conversemos." />

<style>
	.meta {
		color: var(--concrete-300);
	}
	.cover {
		margin-bottom: var(--space-10);
	}
	.cover :global(.img) {
		border-radius: var(--radius-lg);
	}
	.back {
		margin-top: var(--space-12);
	}
</style>
