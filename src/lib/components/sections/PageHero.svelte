<script lang="ts">
	import type { Snippet } from 'svelte';
	import Img from '$lib/components/media/Img.svelte';
	import Highlight from '$lib/components/ui/Highlight.svelte';
	import Breadcrumb from '$lib/components/navigation/Breadcrumb.svelte';
	import type { PublicMedia } from '$lib/types';

	type Crumb = { href?: string; label: string };
	type Props = {
		eyebrow?: string | null;
		title: string;
		lead?: string | null;
		image?: PublicMedia | null;
		crumbs?: Crumb[];
		children?: Snippet;
	};
	let { eyebrow, title, lead, image, crumbs = [], children }: Props = $props();
</script>

<section class="ph" class:ph--image={!!image} data-theme="dark">
	{#if image}
		<div class="ph__bg"><Img media={image} priority sizes="100vw" width={1920} /></div>
	{/if}
	<div class="ph__inner container">
		{#if crumbs.length}<Breadcrumb items={crumbs} />{/if}
		{#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
		<h1 class="display-xl"><Highlight text={title} /></h1>
		{#if lead}<p class="lead">{lead}</p>{/if}
		{#if children}<div class="ph__extra">{@render children()}</div>{/if}
	</div>
</section>

<style>
	.ph {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		background: var(--carbon-900);
		color: var(--white);
		padding-top: calc(64px + clamp(3rem, 2rem + 4vw, 5.5rem));
		padding-bottom: clamp(3rem, 2rem + 4vw, 5.5rem);
	}
	@media (min-width: 1100px) {
		.ph {
			padding-top: calc(88px + clamp(3rem, 2rem + 4vw, 5.5rem));
		}
	}
	.ph::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background-image:
			linear-gradient(rgb(255 255 255 / 0.035) 1px, transparent 1px),
			linear-gradient(90deg, rgb(255 255 255 / 0.035) 1px, transparent 1px);
		background-size: 32px 32px;
	}
	.ph--image {
		min-height: min(70vh, 560px);
		display: flex;
		align-items: flex-end;
	}
	.ph__bg {
		position: absolute;
		inset: 0;
		z-index: -2;
	}
	.ph__bg :global(.img) {
		height: 100%;
	}
	.ph__bg::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, rgb(11 13 12 / 0.88) 0%, rgb(11 13 12 / 0.6) 50%, rgb(11 13 12 / 0.3) 100%);
	}
	.ph__inner {
		display: grid;
		gap: var(--space-4);
		justify-items: start;
	}
	.ph h1 {
		max-width: 20ch;
	}
	.ph .lead {
		color: var(--concrete-200);
	}
	.ph__extra {
		margin-top: var(--space-4);
	}
</style>
