<script lang="ts">
	import { onMount } from 'svelte';
	import { formatNumber } from '$lib/utils/format';

	type Stat = { label: string; value: string | null; prefix: string | null; suffix: string | null };
	let { stat, variant = 'badge' }: { stat: Stat; variant?: 'badge' | 'plain' } = $props();

	const target = $derived(Number(stat.value ?? 0));
	let shown = $state<number | null>(null);
	let el: HTMLElement | undefined = $state();

	// Count-up once when visible (disabled for reduced motion).
	onMount(() => {
		if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const io = new IntersectionObserver(([e]) => {
			if (!e.isIntersecting) return;
			io.disconnect();
			const start = performance.now();
			const tick = (now: number) => {
				const p = Math.min(1, (now - start) / 1200);
				shown = target * (1 - Math.pow(1 - p, 3));
				if (p < 1) requestAnimationFrame(tick);
				else shown = null;
			};
			shown = 0;
			requestAnimationFrame(tick);
		});
		io.observe(el);
		return () => io.disconnect();
	});

	const display = $derived(shown === null ? formatNumber(target) : formatNumber(Number.isInteger(target) ? Math.round(shown) : shown));
</script>

<div class="stat" data-variant={variant} bind:this={el}>
	<p class="stat__value tnum" aria-hidden="true">{stat.prefix ?? ''}{display}{stat.suffix ?? ''}</p>
	<p class="sr-only">{stat.prefix ?? ''}{formatNumber(target)}{stat.suffix ?? ''} {stat.label}</p>
	<p class="stat__label" aria-hidden="true">{stat.label}</p>
</div>

<style>
	.stat {
		display: grid;
		gap: var(--space-1);
	}
	.stat[data-variant='badge'] {
		padding: var(--space-5) var(--space-6);
		background: var(--yellow-500);
		color: var(--carbon-950);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}
	.stat__value {
		font-family: var(--font-display);
		font-size: var(--text-stat);
		font-weight: 800;
		line-height: 1;
	}
	.stat[data-variant='plain'] .stat__value {
		color: var(--color-heading);
	}
	.stat__label {
		font-size: var(--text-caption);
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.stat[data-variant='plain'] .stat__label {
		color: var(--color-text-muted);
	}
</style>
