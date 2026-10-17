<script lang="ts">
	import Img from '$lib/components/media/Img.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Highlight from '$lib/components/ui/Highlight.svelte';
	import type { HomeSectionData } from '$lib/site-config';
	import type { PublicMedia } from '$lib/types';

	let { data, image }: { data: HomeSectionData['hero']; image: PublicMedia | null } = $props();
	const features = $derived(data.features.filter((f) => f.title));
</script>

<section class="hero" data-theme="dark">
	<div class="hero__bg">
		<Img media={image} priority sizes="100vw" width={1920} />
	</div>
	<div class="hero__grain" aria-hidden="true"></div>
	<div class="container hero__inner">
		<div class="hero__copy">
			{#if data.eyebrow}<p class="eyebrow">{data.eyebrow}</p>{/if}
			<h1 class="display-2xl"><Highlight text={data.title} /></h1>
			{#if data.subtitle}<p class="hero__sub">{data.subtitle}</p>{/if}
			<div class="hero__ctas">
				{#if data.primary.label}
					<a href={data.primary.href} class="btn btn--primary btn--lg">
						{data.primary.label} <span class="btn__chip"><Icon name="arrow-right" size={20} /></span>
					</a>
				{/if}
				{#if data.secondary.label}
					<a href={data.secondary.href} class="btn btn--secondary btn--lg">
						{data.secondary.label} <span class="btn__chip"><Icon name="arrow-right" size={20} /></span>
					</a>
				{/if}
			</div>
		</div>
		{#if features.length}
			<ul class="hero__features">
				{#each features as f (f.title)}
					<li class="glass">
						<h2 class="h5">{f.title}</h2>
						{#if f.text}<p>{f.text}</p>{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style>
	.hero {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		min-height: min(100svh, 980px);
		display: flex;
		align-items: flex-end;
		background: var(--carbon-950);
		color: var(--white);
		padding: calc(64px + var(--space-16)) 0 var(--space-8);
	}
	@media (min-width: 1100px) {
		.hero {
			padding-top: calc(88px + var(--space-20));
		}
	}
	.hero__bg {
		position: absolute;
		inset: 0;
		z-index: -2;
	}
	.hero__bg :global(.img) {
		height: 100%;
	}
	.hero__bg::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(90deg, rgb(11 13 12 / 0.88) 0%, rgb(11 13 12 / 0.55) 45%, rgb(11 13 12 / 0.15) 100%),
			linear-gradient(180deg, rgb(11 13 12 / 0) 55%, rgb(11 13 12 / 0.75) 100%);
	}
	.hero__grain {
		position: absolute;
		inset: 0;
		z-index: -1;
		opacity: 0.05;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		pointer-events: none;
	}
	.hero__inner {
		display: grid;
		gap: var(--space-12);
		width: 100%;
	}
	.hero__copy {
		display: grid;
		gap: var(--space-5);
		max-width: 50rem;
	}
	.hero__copy .eyebrow {
		color: var(--concrete-200);
	}
	.hero h1 {
		color: var(--white);
	}
	.hero__sub {
		max-width: 46ch;
		font-size: var(--text-body-lg);
		color: var(--concrete-200);
	}
	.hero__ctas {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-3);
	}
	.hero__features {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-4);
	}
	@media (min-width: 768px) {
		.hero__features {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.glass {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-5) var(--space-6);
		background: rgb(21 24 26 / 0.85);
		border: 1px solid rgb(255 255 255 / 0.14);
		border-radius: var(--radius-lg);
	}
	@supports (backdrop-filter: blur(12px)) {
		.glass {
			background: rgb(21 24 26 / 0.55);
			backdrop-filter: blur(12px);
			-webkit-backdrop-filter: blur(12px);
		}
	}
	.glass h2 {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--white);
	}
	.glass h2::before {
		content: '';
		width: 8px;
		height: 8px;
		background: var(--yellow-500);
	}
	.glass p {
		font-size: var(--text-body-sm);
		color: var(--concrete-200);
	}
</style>
