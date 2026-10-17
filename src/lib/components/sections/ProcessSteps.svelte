<script lang="ts">
	import type { TextItem } from '$lib/site-config';
	let { steps }: { steps: TextItem[] } = $props();
	const visible = $derived(steps.filter((s) => s.title));
</script>

<ol class="steps" style:--n={visible.length}>
	{#each visible as step, i (i)}
		<li class="step">
			<span class="step__num" aria-hidden="true">{i + 1}</span>
			<p class="mono step__label">Paso {String(i + 1).padStart(2, '0')}</p>
			<h3 class="h4">{step.title}</h3>
			{#if step.text}<p class="body-sm muted">{step.text}</p>{/if}
		</li>
	{/each}
</ol>

<style>
	.steps {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-6);
		counter-reset: step;
	}
	@media (min-width: 768px) {
		.steps {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.steps {
			grid-template-columns: repeat(var(--n), 1fr);
			gap: var(--space-8);
		}
	}
	.step {
		position: relative;
		display: grid;
		align-content: start;
		gap: var(--space-2);
		padding: var(--space-6);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}
	.step:first-child {
		border: 2px solid var(--yellow-500);
	}
	.step__num {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		margin-bottom: var(--space-3);
		border-radius: 50%;
		background: var(--carbon-900);
		color: var(--white);
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
	}
	.step:first-child .step__num {
		background: var(--yellow-500);
		color: var(--carbon-950);
	}
	@media (min-width: 1024px) {
		.step:not(:last-child)::after {
			content: '';
			position: absolute;
			top: calc(var(--space-6) + 20px);
			left: calc(var(--space-6) + 48px);
			right: calc(var(--space-8) * -1 - var(--space-2));
			border-top: 2px dashed var(--color-border-strong);
		}
	}
	.step__label {
		color: var(--color-accent-text);
		font-size: 0.75rem;
	}
</style>
