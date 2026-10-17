<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import SectionHeading from '$lib/components/sections/SectionHeading.svelte';
	import CtaBand from '$lib/components/sections/CtaBand.svelte';
	import { mediaUrl } from '$lib/utils/image';

	let { data } = $props();
	const sectors = $derived([...new Set(data.clients.map((c) => c.sector).filter(Boolean))] as string[]);
</script>

<Seo title="Clientes" description="Empresas e instituciones que confían en Othalan para sus proyectos de ingeniería y construcción." />

<PageHero eyebrow="Clientes" title="Empresas que *confían* en nosotros" lead="Trabajamos con la industria, el comercio y el sector público en distintas regiones de Chile." crumbs={[{ label: 'Clientes' }]} />

<section class="section">
	<div class="container">
		{#if data.clients.length}
			{#if sectors.length}
				<p class="sectors">{#each sectors as s (s)}<span class="badge">{s}</span>{/each}</p>
			{/if}
			<ul class="clients">
				{#each data.clients as c (c.id)}
					<li class="card">
						{#if c.logo}
							<img src={mediaUrl(c.logo.storageKey, { w: 400 })} alt={c.name} loading="lazy" />
						{:else}
							<span class="h5">{c.name}</span>
						{/if}
						{#if c.sector}<span class="caption">{c.sector}</span>{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<div class="empty">
				<Icon name="building-community" size={48} />
				<p>Pronto publicaremos los clientes con los que hemos trabajado.</p>
			</div>
		{/if}
	</div>
</section>

{#if data.testimonials.length}
	<section class="section section--alt">
		<div class="container">
			<SectionHeading eyebrow="Testimonios" title="Lo que dicen nuestros *clientes*" />
			<ul class="quotes">
				{#each data.testimonials as t (t.id)}
					<li class="card quote">
						<span class="q" aria-hidden="true">“</span>
						<blockquote><p>{t.quote}</p></blockquote>
						<p><strong>{t.authorName}</strong><br /><span class="muted body-sm">{[t.authorRole, t.company ?? t.clientName].filter(Boolean).join(' · ')}</span></p>
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

<CtaBand title="Súmate a nuestros *clientes*" text="Conversemos sobre tu proyecto." />

<style>
	.sectors {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-8);
	}
	.clients {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--grid-gutter);
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	}
	.clients li {
		display: grid;
		place-items: center;
		gap: var(--space-3);
		min-height: 160px;
		padding: var(--space-6);
		text-align: center;
	}
	.clients img {
		max-height: 64px;
		max-width: 160px;
		object-fit: contain;
		filter: grayscale(1);
		opacity: 0.75;
		transition: all var(--duration-base);
	}
	@media (hover: hover) {
		.clients li:hover img {
			filter: none;
			opacity: 1;
		}
	}
	.empty {
		display: grid;
		justify-items: center;
		gap: var(--space-4);
		padding: var(--space-16);
		color: var(--color-text-muted);
		text-align: center;
	}
	.quotes {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--grid-gutter);
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	}
	.quote {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-8) var(--space-6) var(--space-6);
	}
	.q {
		font-family: Georgia, serif;
		font-size: 4rem;
		line-height: 0.6;
		color: var(--yellow-500);
	}
	blockquote {
		font-size: var(--text-body-lg);
	}
</style>
