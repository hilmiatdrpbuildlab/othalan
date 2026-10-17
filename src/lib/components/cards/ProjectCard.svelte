<script lang="ts">
	import Img from '$lib/components/media/Img.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { formatInt, formatNumber } from '$lib/utils/format';
	import type { PublicMedia } from '$lib/types';

	type Props = {
		href: string;
		title: string;
		cover: PublicMedia | null;
		category?: string | null;
		code?: string | null;
		location?: string | null;
		year?: number | null;
		areaM2?: number | null;
		steelTons?: string | number | null;
		ratio?: string;
		sizes?: string;
		specs?: boolean;
		class?: string;
	};
	let {
		href,
		title,
		cover,
		category,
		code,
		location,
		year,
		areaM2,
		steelTons,
		ratio = '4/3',
		sizes = '(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw',
		specs = true,
		class: className = ''
	}: Props = $props();

	const meta = $derived([code, location].filter(Boolean).join(' · '));
	const specItems = $derived(
		[
			areaM2 ? { v: `${formatInt(areaM2)} m²`, l: 'Superficie' } : null,
			steelTons && Number(steelTons) > 0 ? { v: `${formatNumber(steelTons)} t`, l: 'Acero' } : null,
			year ? { v: String(year), l: 'Año' } : null
		].filter((x): x is { v: string; l: string } => !!x)
	);
</script>

<a {href} class="pc {className}">
	<div class="pc__media">
		<Img media={cover} {ratio} {sizes} width={1024} />
		<div class="pc__overlay"></div>
		{#if category}<span class="badge badge--brand pc__tag">{category}</span>{/if}
		<span class="pc__arrow" aria-hidden="true"><Icon name="arrow-up-right" size={20} /></span>
		<div class="pc__caption">
			{#if meta}<p class="mono pc__meta">{meta}</p>{/if}
			<h3 class="h4 pc__title line-clamp-2">{title}</h3>
		</div>
	</div>
	{#if specs && specItems.length}
		<dl class="pc__specs">
			{#each specItems as s (s.l)}
				<div><dt class="caption">{s.l}</dt><dd class="mono">{s.v}</dd></div>
			{/each}
		</dl>
	{/if}
</a>

<style>
	.pc {
		display: flex;
		flex-direction: column;
		height: 100%;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
		text-decoration: none;
		transition:
			box-shadow var(--duration-base),
			transform var(--duration-fast);
	}
	.pc__media {
		position: relative;
		flex: 1;
		overflow: hidden;
		isolation: isolate;
	}
	.pc__media :global(.img) {
		height: 100%;
	}
	.pc__media :global(img) {
		transition: transform var(--duration-slow) var(--ease-standard);
	}
	.pc__overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgb(11 13 12 / 0) 35%, rgb(11 13 12 / 0.85) 100%);
		transition: background var(--duration-slow);
	}
	.pc__tag {
		position: absolute;
		top: var(--space-4);
		left: var(--space-4);
	}
	.pc__arrow {
		position: absolute;
		top: var(--space-3);
		right: var(--space-3);
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.92);
		color: var(--carbon-950);
		transition:
			background var(--duration-base),
			transform var(--duration-base) var(--ease-emphasized);
	}
	.pc__caption {
		position: absolute;
		inset: auto 0 0;
		padding: var(--space-5);
		color: var(--white);
	}
	.pc__meta {
		color: var(--concrete-200);
		font-size: 0.75rem;
		margin-bottom: var(--space-1);
	}
	.pc__title {
		color: var(--white);
		text-transform: uppercase;
	}
	.pc__specs {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		border-top: 1px solid var(--color-border);
	}
	.pc__specs div {
		padding: var(--space-3) var(--space-4);
	}
	.pc__specs div + div {
		border-left: 1px solid var(--color-border);
	}
	.pc__specs dd {
		color: var(--color-text);
	}
	@media (hover: hover) {
		.pc:hover {
			box-shadow: var(--shadow-md);
		}
		.pc:hover .pc__media :global(img) {
			transform: scale(1.04);
		}
		.pc:hover .pc__overlay {
			background: linear-gradient(180deg, rgb(11 13 12 / 0.1) 30%, rgb(11 13 12 / 0.92) 100%);
		}
		.pc:hover .pc__arrow {
			background: var(--yellow-500);
			transform: rotate(45deg);
		}
	}
	.pc:active {
		transform: scale(0.99);
	}
	.pc:focus-visible {
		outline: 3px solid var(--yellow-500);
		outline-offset: 2px;
		box-shadow: inset 0 0 0 1px var(--carbon-950);
	}
</style>
