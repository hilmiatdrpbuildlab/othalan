<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import SectionHeading from '$lib/components/sections/SectionHeading.svelte';
	import TeamCard from '$lib/components/cards/TeamCard.svelte';
	import CtaBand from '$lib/components/sections/CtaBand.svelte';

	let { data } = $props();
	const groups = $derived(
		[
			{ key: 'directivo', title: 'Equipo directivo' },
			{ key: 'jefatura', title: 'Jefaturas' },
			{ key: 'equipo', title: 'Equipo' }
		]
			.map((g) => ({ ...g, members: data.team.filter((m) => m.group === g.key) }))
			.filter((g) => g.members.length)
	);
</script>

<Seo title="Equipo" description="Conoce al equipo de Othalan Ingeniería y Construcción." />

<PageHero eyebrow="Equipo" title="Un equipo *en terreno*" lead="Personas con experiencia que lideran cada obra de forma directa." crumbs={[{ href: '/nosotros', label: 'Nosotros' }, { label: 'Equipo' }]} />

{#each groups as g, i (g.key)}
	<section class="section" class:section--alt={i % 2 === 1}>
		<div class="container">
			<SectionHeading title={g.title} />
			<div class="team">
				{#each g.members as m (m.id)}<TeamCard member={m} />{/each}
			</div>
		</div>
	</section>
{/each}

<CtaBand title="¿Quieres ser parte del *equipo*?" text="Revisa nuestras ofertas laborales vigentes." label="Trabaja con nosotros" href="/trabaja-con-nosotros" />

<style>
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
</style>
