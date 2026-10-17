<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Img from '$lib/components/media/Img.svelte';
	import Lightbox from '$lib/components/media/Lightbox.svelte';
	import Breadcrumb from '$lib/components/navigation/Breadcrumb.svelte';
	import SectionHeading from '$lib/components/sections/SectionHeading.svelte';
	import ProjectCard from '$lib/components/cards/ProjectCard.svelte';
	import CtaBand from '$lib/components/sections/CtaBand.svelte';
	import { formatClp, formatInt, formatNumber } from '$lib/utils/format';
	import { page } from '$app/state';

	let { data } = $props();
	const p = $derived(data.project);
	let lightbox = $state(-1);

	const location = $derived([p.comuna, p.region].filter(Boolean).join(', '));
	const ficha = $derived(
		[
			['Mandante', p.client],
			['Categoría', p.categoryName],
			['Ubicación', location],
			['Año', p.year ? String(p.year) : null],
			['Superficie', p.areaM2 ? `${formatInt(p.areaM2)} m²` : null],
			['Acero', p.steelTons && Number(p.steelTons) > 0 ? `${formatNumber(p.steelTons)} t` : null],
			['Plazo', p.durationMonths ? `${formatNumber(p.durationMonths)} ${Number(p.durationMonths) === 1 ? 'mes' : 'meses'}` : null],
			['Monto', p.amountClp ? formatClp(p.amountClp) : null],
			['Código', p.code]
		].filter((r): r is [string, string] => !!r[1])
	);
	const narrative = $derived(
		[
			{ t: 'El desafío', h: data.html.challenge },
			{ t: 'La solución', h: data.html.solution },
			{ t: 'El resultado', h: data.html.result }
		].filter((n) => n.h)
	);
	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'CreativeWork',
		name: p.title,
		description: p.summary,
		...(p.cover ? { image: page.url.origin + '/media/' + p.cover.storageKey.replace('public/media/', '') } : {}),
		...(p.year ? { dateCreated: String(p.year) } : {}),
		...(location ? { locationCreated: { '@type': 'Place', name: location } } : {}),
		creator: { '@type': 'GeneralContractor', name: data.settings.legalName }
	});
</script>

<Seo title={p.seoTitle || p.title} description={p.seoDescription || p.summary} imageKey={p.cover?.storageKey} type="article" {jsonLd} />

<section class="cover" data-theme="dark">
	<div class="container cover__head">
		<Breadcrumb items={[{ href: '/proyectos', label: 'Proyectos' }, { label: p.title }]} />
		<div class="cover__tags">
			{#if p.categoryName}<a class="badge badge--brand" href="/proyectos?categoria={p.categorySlug}">{p.categoryName}</a>{/if}
			{#if location}<span class="mono"><Icon name="map-pin" size={14} /> {location}</span>{/if}
		</div>
		<h1 class="display-xl">{p.title}</h1>
		{#if p.summary}<p class="lead">{p.summary}</p>{/if}
	</div>
	{#if p.cover}
		<div class="container">
			<div class="cover__img"><Img media={p.cover} ratio="16/10" priority sizes="(min-width:1280px) 1280px, 100vw" width={1920} /></div>
		</div>
	{/if}
</section>

<section class="section">
	<div class="container detail">
		<aside class="ficha">
			<h2 class="h5">Ficha técnica</h2>
			<dl>
				{#each ficha as [k, v] (k)}
					<div><dt>{k}</dt><dd class="mono">{v}</dd></div>
				{/each}
			</dl>
			{#if p.services.length}
				<div class="ficha__svc">
					<p class="caption">Servicios</p>
					{#each p.services as s (s.id)}<a href="/servicios/{s.slug}" class="link-arrow">{s.title} <Icon name="arrow-right" size={14} /></a>{/each}
				</div>
			{/if}
			<a href="/cotizacion" class="btn btn--primary btn--block">Cotizar un proyecto similar</a>
		</aside>
		<div class="story">
			{#if p.scope}
				<div class="block">
					<h2 class="h3">Alcance</h2>
					<p class="lead">{p.scope}</p>
				</div>
			{/if}
			{#each narrative as n (n.t)}
				<div class="block">
					<h2 class="h3">{n.t}</h2>
					<div class="prose">{@html n.h}</div>
				</div>
			{/each}
		</div>
	</div>
</section>

{#if p.gallery.length}
	<section class="section section--alt" aria-labelledby="h-gal">
		<div class="container">
			<SectionHeading id="h-gal" eyebrow="Galería" title="Registro de *obra*" />
			<ul class="gallery">
				{#each p.gallery as g, i (g.media.id + i)}
					<li>
						<button type="button" onclick={() => (lightbox = i)} aria-label="Ampliar imagen {i + 1}: {g.media.alt}">
							<Img media={g.media} sizes="(min-width:1024px) 33vw, 50vw" width={768} />
							<span class="gallery__zoom" aria-hidden="true"><Icon name="zoom-in" size={20} /></span>
						</button>
						{#if g.caption}<p class="caption">{g.caption}</p>{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>
	<Lightbox items={p.gallery} bind:index={lightbox} />
{/if}

{#if data.related.length}
	<section class="section">
		<div class="container">
			<SectionHeading eyebrow="Más proyectos" title="Sigue *explorando*">
				{#snippet actions()}<a href="/proyectos" class="link-arrow">Ver todos <Icon name="arrow-right" size={16} /></a>{/snippet}
			</SectionHeading>
			<div class="related">
				{#each data.related as r (r.id)}
					<ProjectCard href="/proyectos/{r.slug}" title={r.title} cover={r.cover} category={r.categoryName} code={r.code} year={r.year} areaM2={r.areaM2} steelTons={r.steelTons} />
				{/each}
			</div>
		</div>
	</section>
{/if}

<CtaBand title="¿Tienes un proyecto *similar*?" text="Te ayudamos a planificarlo y ejecutarlo con seguridad." />

<style>
	.cover {
		background: var(--carbon-900);
		color: var(--white);
		padding-top: calc(64px + var(--space-12));
		padding-bottom: var(--space-12);
	}
	@media (min-width: 1100px) {
		.cover {
			padding-top: calc(88px + var(--space-16));
		}
	}
	.cover__head {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-10);
	}
	.cover__tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		align-items: center;
		color: var(--concrete-300);
	}
	.cover__tags .badge {
		text-decoration: none;
	}
	.cover__tags .mono {
		display: inline-flex;
		gap: 4px;
		align-items: center;
	}
	.cover h1 {
		max-width: 22ch;
	}
	.cover .lead {
		color: var(--concrete-200);
	}
	.cover__img :global(.img) {
		border-radius: var(--radius-xl);
	}
	.detail {
		display: grid;
		gap: var(--space-12);
	}
	@media (min-width: 1024px) {
		.detail {
			grid-template-columns: 4fr 8fr;
			gap: var(--space-16);
		}
		.ficha {
			position: sticky;
			top: 120px;
			align-self: start;
		}
	}
	.ficha {
		display: grid;
		gap: var(--space-5);
		padding: var(--space-6);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-top: 4px solid var(--yellow-500);
		border-radius: var(--radius-lg);
	}
	.ficha dl div {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border-bottom: 1px dashed var(--color-border);
	}
	.ficha dt {
		font-size: var(--text-body-sm);
		color: var(--color-text-muted);
	}
	.ficha dd {
		text-align: right;
	}
	.ficha__svc {
		display: grid;
		gap: var(--space-2);
	}
	.story {
		display: grid;
		gap: var(--space-10);
		align-content: start;
	}
	.block {
		display: grid;
		gap: var(--space-4);
		align-content: start;
	}
	.gallery {
		list-style: none;
		padding: 0;
		columns: 2 260px;
		column-gap: var(--grid-gutter);
	}
	@media (min-width: 1024px) {
		.gallery {
			columns: 3;
		}
	}
	.gallery li {
		break-inside: avoid;
		margin-bottom: var(--grid-gutter);
	}
	.gallery button {
		position: relative;
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		border-radius: var(--radius-lg);
		overflow: hidden;
		cursor: zoom-in;
	}
	.gallery__zoom {
		position: absolute;
		right: 12px;
		bottom: 12px;
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.9);
		opacity: 0;
		transition: opacity var(--duration-base);
	}
	.gallery button:hover .gallery__zoom,
	.gallery button:focus-visible .gallery__zoom {
		opacity: 1;
	}
	.related {
		display: grid;
		gap: var(--grid-gutter);
	}
	@media (min-width: 768px) {
		.related {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
