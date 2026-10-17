<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Img from '$lib/components/media/Img.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import SectionHeading from '$lib/components/sections/SectionHeading.svelte';
	import CtaBand from '$lib/components/sections/CtaBand.svelte';
	import TeamCard from '$lib/components/cards/TeamCard.svelte';
	import StatBlock from '$lib/components/cards/StatBlock.svelte';
	import { page as appPage } from '$app/state';

	let { data } = $props();
	const pg = $derived(data.page);
	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'AboutPage',
		mainEntity: {
			'@type': 'Organization',
			name: data.settings.legalName,
			url: appPage.url.origin,
			employee: data.directivos.map((m) => ({
				'@type': 'Person',
				name: m.name,
				jobTitle: m.roleTitle,
				...(m.linkedinUrl ? { sameAs: [m.linkedinUrl] } : {}),
				worksFor: { '@type': 'Organization', name: data.settings.legalName }
			}))
		}
	});
</script>

<Seo title={pg?.seoTitle || 'Nosotros'} description={pg?.seoDescription || pg?.intro} imageKey={pg?.cover?.storageKey} {jsonLd} />

<PageHero eyebrow="Nosotros" title={pg?.title ?? 'Nosotros'} lead={pg?.intro} image={pg?.cover} crumbs={[{ label: 'Nosotros' }]} />

{#if data.bodyHtml || data.stats.length}
	<section class="section">
		<div class="container about">
			<div class="prose">{@html data.bodyHtml}</div>
			{#if data.stats.length}
				<div class="about__stats">
					{#each data.stats as st (st.id)}<StatBlock stat={st} variant="plain" />{/each}
				</div>
			{/if}
		</div>
	</section>
{/if}

{#if data.values.length}
	<section class="section section--alt blueprint" aria-labelledby="h-values">
		<div class="container">
			<SectionHeading id="h-values" eyebrow="Valores" title="Lo que nos *mueve*" />
			<ul class="values">
				{#each data.values as v (v.id)}
					<li class="card value">
						<span class="value__icon"><Icon name={v.icon} size={28} /></span>
						<h3 class="h4">{v.title}</h3>
						{#if v.description}<p class="body-sm muted">{v.description}</p>{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

{#if data.directivos.length}
	<section class="section" id="equipo" aria-labelledby="h-equipo">
		<div class="container">
			<SectionHeading id="h-equipo" eyebrow="Equipo directivo" title="Las personas *detrás* de cada obra" lead="Lideran cada proyecto de forma directa, desde la primera visita técnica hasta la entrega.">
				{#snippet actions()}
					{#if data.otherTeam.length}<a href="/nosotros/equipo" class="link-arrow">Ver equipo completo <Icon name="arrow-right" size={16} /></a>{/if}
				{/snippet}
			</SectionHeading>
			<div class="team">
				{#each data.directivos as m (m.id)}<TeamCard member={m} />{/each}
			</div>
		</div>
	</section>
{/if}

{#if data.timeline.length}
	<section class="section section--alt" aria-labelledby="h-hist">
		<div class="container container--narrow">
			<SectionHeading id="h-hist" eyebrow="Trayectoria" title="Nuestra *historia*" />
			<ol class="timeline">
				{#each data.timeline as e (e.id)}
					<li>
						<span class="timeline__year">{e.year}</span>
						<div>
							<h3 class="h4">{e.title}</h3>
							{#if e.description}<p class="muted">{e.description}</p>{/if}
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</section>
{/if}

{#if data.equipment.length}
	<section class="section" aria-labelledby="h-cap">
		<div class="container">
			<SectionHeading id="h-cap" eyebrow="Capacidades" title="Maquinaria y *equipos*" lead="Contamos con equipos propios para responder con rapidez en terreno." />
			<ul class="equip">
				{#each data.equipment as eq (eq.id)}
					<li class="card">
						{#if eq.photo}<Img media={eq.photo} ratio="4/3" width={768} sizes="(min-width:1024px) 25vw, 50vw" />{/if}
						<div class="equip__body">
							{#if eq.category}<span class="caption">{eq.category}</span>{/if}
							<h3 class="h5">{eq.name}</h3>
							<p class="mono">
								{#if eq.quantity}{eq.quantity} un.{/if}{#if eq.quantity && eq.capacity}&nbsp;·&nbsp;{/if}{eq.capacity ?? ''}
							</p>
							{#if eq.description}<p class="body-sm muted">{eq.description}</p>{/if}
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

{#if data.certifications.length}
	<section class="section section--alt">
		<div class="container">
			<SectionHeading eyebrow="Certificaciones y registros" title="Respaldo *verificable*">
				{#snippet actions()}<a href="/seguridad-y-calidad" class="link-arrow">Seguridad y calidad <Icon name="arrow-right" size={16} /></a>{/snippet}
			</SectionHeading>
			<ul class="certs">
				{#each data.certifications as c (c.id)}
					<li class="card"><Icon name="certificate" size={24} /><span><strong>{c.name}</strong>{#if c.issuer}<small>{c.issuer}</small>{/if}</span></li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

<CtaBand title="Trabajemos *juntos*" text="Conversemos sobre tu próximo proyecto." />

<style>
	.about {
		display: grid;
		gap: var(--space-12);
	}
	@media (min-width: 1024px) {
		.about {
			grid-template-columns: 7fr 4fr;
			gap: var(--space-16);
		}
	}
	.about__stats {
		display: grid;
		gap: var(--space-8);
		align-content: start;
		padding-left: var(--space-8);
		border-left: 4px solid var(--yellow-500);
	}
	.values {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--grid-gutter);
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	}
	.value {
		display: grid;
		gap: var(--space-3);
		align-content: start;
		padding: var(--space-6);
	}
	.value__icon {
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		border: 2px solid var(--carbon-900);
		border-radius: var(--radius-md);
	}
	.team {
		display: grid;
		gap: var(--grid-gutter);
	}
	@media (min-width: 768px) {
		.team {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.team {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.timeline {
		list-style: none;
		padding: 0;
		border-left: 2px solid var(--color-border-strong);
		display: grid;
		gap: var(--space-8);
	}
	.timeline li {
		position: relative;
		display: grid;
		gap: var(--space-2);
		padding-left: var(--space-8);
	}
	.timeline li::before {
		content: '';
		position: absolute;
		left: -7px;
		top: 8px;
		width: 12px;
		height: 12px;
		background: var(--yellow-500);
		outline: 2px solid var(--carbon-950);
	}
	.timeline__year {
		font-family: var(--font-mono);
		color: var(--color-accent-text);
		font-weight: 500;
	}
	.equip,
	.certs {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--grid-gutter);
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	}
	.equip li {
		overflow: hidden;
	}
	.equip__body {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-5);
	}
	.certs li {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		padding: var(--space-4) var(--space-5);
	}
	.certs small {
		display: block;
		color: var(--color-text-muted);
	}
</style>
