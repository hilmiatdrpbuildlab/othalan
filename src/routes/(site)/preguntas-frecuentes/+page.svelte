<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Faq from '$lib/components/sections/Faq.svelte';
	import CtaBand from '$lib/components/sections/CtaBand.svelte';

	let { data } = $props();
	const groups = $derived(
		[...new Set(data.faqs.map((f) => f.category || 'General'))].map((cat) => ({
			cat,
			items: data.faqs.filter((f) => (f.category || 'General') === cat)
		}))
	);
	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: data.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }))
	});
</script>

<Seo title="Preguntas frecuentes" description="Respuestas sobre cotizaciones, plazos, cobertura y servicios de Othalan." {jsonLd} />

<PageHero eyebrow="Ayuda" title="Preguntas *frecuentes*" crumbs={[{ label: 'Preguntas frecuentes' }]} />

<section class="section">
	<div class="container container--narrow">
		{#each groups as g (g.cat)}
			<h2 class="h4 cat">{g.cat}</h2>
			<Faq items={g.items} />
		{/each}
	</div>
</section>

<CtaBand title="¿No encontraste tu *respuesta*?" text="Escríbenos y te ayudamos." label="Contáctanos" href="/contacto" />

<style>
	.cat {
		margin: var(--space-12) 0 var(--space-2);
		color: var(--color-accent-text);
	}
	.cat:first-child {
		margin-top: 0;
	}
</style>
