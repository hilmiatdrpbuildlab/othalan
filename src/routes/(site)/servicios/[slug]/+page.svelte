<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import SectionHeading from '$lib/components/sections/SectionHeading.svelte';
	import CtaBand from '$lib/components/sections/CtaBand.svelte';
	import ProjectCard from '$lib/components/cards/ProjectCard.svelte';
	import ServiceCard from '$lib/components/cards/ServiceCard.svelte';
	import Faq from '$lib/components/sections/Faq.svelte';
	import { page } from '$app/state';

	let { data } = $props();
	const s = $derived(data.service);
	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'Service',
		name: s.title,
		description: s.summary,
		serviceType: s.title,
		areaServed: { '@type': 'Country', name: 'Chile' },
		provider: { '@type': 'GeneralContractor', name: data.settings.legalName, url: page.url.origin }
	});
</script>

<Seo title={s.seoTitle || s.title} description={s.seoDescription || s.summary} imageKey={s.cover?.storageKey} {jsonLd} />

<PageHero eyebrow="Servicio" title={s.title} lead={s.summary} image={s.cover} crumbs={[{ href: '/servicios', label: 'Servicios' }, { label: s.title }]}>
	<a href="/cotizacion?servicio={s.slug}" class="btn btn--primary btn--lg">Cotizar este servicio <span class="btn__chip"><Icon name="arrow-right" size={20} /></span></a>
</PageHero>

<section class="section">
	<div class="container detail">
		<div class="prose">{@html data.bodyHtml}</div>
		<aside class="side">
			{#if s.subServices.length}
				<div class="card box">
					<h2 class="h5">Qué incluye</h2>
					<ul class="checks">
						{#each s.subServices as sub (sub)}<li><Icon name="check" size={18} />{sub}</li>{/each}
					</ul>
				</div>
			{/if}
			{#if s.capabilities.length}
				<div class="card box">
					<h2 class="h5">Capacidades</h2>
					<ul class="specs">
						{#each s.capabilities as c (c)}<li class="mono">{c}</li>{/each}
					</ul>
				</div>
			{/if}
			<div class="card box box--dark" data-theme="dark">
				<h2 class="h5">¿Hablamos?</h2>
				<p>Te respondemos en {data.settings.rfqResponseTime}.</p>
				<a href="/cotizacion?servicio={s.slug}" class="btn btn--primary btn--block">Solicitar cotización</a>
			</div>
		</aside>
	</div>
</section>

{#if data.projects.length}
	<section class="section section--alt">
		<div class="container">
			<SectionHeading eyebrow="Proyectos relacionados" title="Trabajos de *{s.title.toLowerCase()}*" />
			<div class="grid3">
				{#each data.projects as p (p.id)}
					<ProjectCard
						href="/proyectos/{p.slug}"
						title={p.title}
						cover={p.cover}
						category={p.categoryName}
						code={p.code}
						location={[p.comuna, p.region].filter(Boolean).join(', ')}
						year={p.year}
						areaM2={p.areaM2}
						steelTons={p.steelTons}
					/>
				{/each}
			</div>
		</div>
	</section>
{/if}

{#if data.faqs.length}
	<section class="section">
		<div class="container container--narrow">
			<SectionHeading eyebrow="Preguntas frecuentes" title="Antes de cotizar" />
			<Faq items={data.faqs} />
		</div>
	</section>
{/if}

{#if data.others.length}
	<section class="section section--alt">
		<div class="container">
			<SectionHeading eyebrow="Otros servicios" title="También podemos *ayudarte* con" />
			<div class="grid3">
				{#each data.others as o (o.id)}<ServiceCard href="/servicios/{o.slug}" icon={o.icon} title={o.title} summary={o.summary} />{/each}
			</div>
		</div>
	</section>
{/if}

<CtaBand title="¿Listo para *empezar*?" text="Envíanos los antecedentes de tu proyecto y coordinamos una visita técnica." />

<style>
	.detail {
		display: grid;
		gap: var(--space-12);
	}
	@media (min-width: 1024px) {
		.detail {
			grid-template-columns: 7fr 4fr;
			gap: var(--space-16);
		}
	}
	.side {
		display: grid;
		gap: var(--space-4);
		align-content: start;
	}
	@media (min-width: 1024px) {
		.side {
			position: sticky;
			top: 120px;
		}
	}
	.box {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-6);
	}
	.box--dark {
		background: var(--carbon-900);
		border-color: var(--carbon-700);
		color: var(--concrete-200);
	}
	.box--dark h2 {
		color: var(--yellow-500);
	}
	.checks,
	.specs {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-2);
	}
	.checks li {
		display: flex;
		gap: var(--space-2);
	}
	.checks :global(svg) {
		flex: none;
		margin-top: 3px;
		color: var(--success-600);
	}
	.specs li {
		padding: var(--space-2) 0;
		border-bottom: 1px dashed var(--color-border);
	}
	.grid3 {
		display: grid;
		gap: var(--grid-gutter);
	}
	@media (min-width: 768px) {
		.grid3 {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.grid3 {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
