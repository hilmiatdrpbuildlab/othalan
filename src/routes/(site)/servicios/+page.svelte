<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Img from '$lib/components/media/Img.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import CtaBand from '$lib/components/sections/CtaBand.svelte';

	let { data } = $props();
</script>

<Seo title="Servicios" description="Ingeniería y planificación, obras civiles, montaje industrial y mantención en Chile." />

<PageHero
	eyebrow="Servicios"
	title="Soluciones de *ingeniería* y construcción"
	lead="Acompañamos tu proyecto desde la evaluación técnica hasta la entrega y la mantención, con un solo equipo y trato directo."
	crumbs={[{ label: 'Servicios' }]}
/>

<section class="section">
	<div class="container list">
		{#each data.services as s, i (s.id)}
			<article class="row" class:row--rev={i % 2 === 1}>
				<div class="row__media">
					{#if s.cover}
						<Img media={s.cover} ratio="4/3" sizes="(min-width:1024px) 45vw, 100vw" width={1024} />
					{:else}
						<div class="row__ph blueprint"><Icon name={s.icon} size={96} stroke={1.25} /></div>
					{/if}
				</div>
				<div class="row__text">
					<p class="mono idx">{String(i + 1).padStart(2, '0')} / {String(data.services.length).padStart(2, '0')}</p>
					<h2 class="h2">{s.title}</h2>
					{#if s.summary}<p class="lead">{s.summary}</p>{/if}
					{#if s.subServices.length}
						<ul class="subs">
							{#each s.subServices as sub (sub)}<li><Icon name="check" size={18} />{sub}</li>{/each}
						</ul>
					{/if}
					<a href="/servicios/{s.slug}" class="btn btn--secondary">Ver servicio <span class="btn__chip"><Icon name="arrow-right" size={16} /></span></a>
				</div>
			</article>
		{:else}
			<p class="muted">Pronto publicaremos nuestros servicios.</p>
		{/each}
	</div>
</section>

<CtaBand title="¿Necesitas una *solución* a medida?" text="Cuéntanos tu proyecto y te ayudamos a definir el alcance." />

<style>
	.list {
		display: grid;
		gap: clamp(3rem, 2rem + 4vw, 6rem);
	}
	.row {
		display: grid;
		gap: var(--space-8);
		align-items: center;
	}
	@media (min-width: 1024px) {
		.row {
			grid-template-columns: 1fr 1fr;
			gap: var(--space-16);
		}
		.row--rev .row__media {
			order: 2;
		}
	}
	.row__media :global(.img),
	.row__ph {
		border-radius: var(--radius-lg);
	}
	.row__ph {
		display: grid;
		place-items: center;
		aspect-ratio: 4/3;
		background-color: var(--concrete-50);
		border: 1px solid var(--color-border);
		color: var(--carbon-900);
	}
	.row__text {
		display: grid;
		gap: var(--space-4);
		justify-items: start;
	}
	.idx {
		color: var(--color-accent-text);
	}
	.subs {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}
	.subs li {
		display: flex;
		gap: var(--space-2);
		align-items: flex-start;
	}
	.subs :global(svg) {
		flex: none;
		margin-top: 3px;
		color: var(--success-600);
	}
</style>
