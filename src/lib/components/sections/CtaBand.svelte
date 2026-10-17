<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import Highlight from '$lib/components/ui/Highlight.svelte';

	type Props = { title: string; text?: string | null; label?: string; href?: string; whatsapp?: string | null };
	let { title, text, label = 'Solicitar cotización', href = '/cotizacion', whatsapp }: Props = $props();
</script>

<section class="cta" aria-label="Llamado a la acción">
	<div class="container cta__inner">
		<div class="cta__text">
			<h2 class="display-xl"><Highlight text={title} /></h2>
			{#if text}<p>{text}</p>{/if}
		</div>
		<div class="cta__actions">
			<a {href} class="btn btn--secondary btn--lg">{label} <span class="btn__chip"><Icon name="arrow-right" size={20} /></span></a>
			{#if whatsapp}
				<a href={whatsapp} class="btn btn--whatsapp btn--lg" target="_blank" rel="noopener"><Icon name="brand-whatsapp" size={22} /> WhatsApp</a>
			{/if}
		</div>
	</div>
</section>

<style>
	.cta {
		position: relative;
		overflow: hidden;
		background: var(--yellow-500);
		color: var(--carbon-950);
		padding-block: clamp(3.5rem, 2.5rem + 4vw, 6rem);
	}
	.cta::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(-45deg, rgb(11 13 12 / 0.06) 0 18px, transparent 18px 36px);
		mask-image: linear-gradient(90deg, transparent 50%, #000);
		pointer-events: none;
	}
	.cta__inner {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-8);
	}
	.cta__text {
		display: grid;
		gap: var(--space-3);
		max-width: 44rem;
	}
	.cta h2 {
		color: var(--carbon-950);
	}
	.cta :global(mark) {
		color: var(--carbon-950);
		text-decoration: underline;
		text-decoration-thickness: 4px;
		text-underline-offset: 6px;
	}
	.cta p {
		font-size: var(--text-body-lg);
		max-width: 56ch;
	}
	.cta__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}
</style>
