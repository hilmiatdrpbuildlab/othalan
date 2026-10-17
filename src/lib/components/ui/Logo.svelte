<script lang="ts">
	import paths from './logo-paths.json';
	import { mediaUrl } from '$lib/utils/image';

	type Props = {
		/** horizontal = emblem + wordmark (navbar), emblem = icon only */
		variant?: 'horizontal' | 'emblem';
		tone?: 'light' | 'dark';
		size?: number;
		/** Optional logo uploaded in CMS settings — replaces the vector emblem. */
		customKey?: string | null;
		showTagline?: boolean;
	};
	let { variant = 'horizontal', tone = 'light', size = 40, customKey, showTagline = true }: Props = $props();
</script>

<span class="logo" data-tone={tone} style:--logo-size="{size}px">
	{#if customKey}
		<img src={mediaUrl(customKey)} alt="" class="logo__custom" height={size} />
	{:else}
		<svg class="logo__emblem" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
			<path d={paths.gear} fill="var(--yellow-400)" stroke="var(--carbon-950)" stroke-width="2.2" stroke-linejoin="round" />
			<circle cx="50" cy="50" r="37.5" fill="var(--carbon-950)" />
			<g fill="none" stroke="var(--yellow-400)" stroke-width="4.2">
				{#each paths.arcs as d (d)}<path {d} />{/each}
			</g>
			<path d={paths.inner} fill="var(--yellow-400)" />
		</svg>
	{/if}
	{#if variant === 'horizontal'}
		<span class="logo__text">
			<span class="logo__word">OTHALAN</span>
			{#if showTagline}<span class="logo__tag">Ingeniería y Construcción</span>{/if}
		</span>
	{/if}
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		color: var(--carbon-950);
	}
	.logo[data-tone='dark'] {
		color: var(--white);
	}
	.logo__emblem,
	.logo__custom {
		width: var(--logo-size);
		height: var(--logo-size);
		flex: none;
		object-fit: contain;
	}
	.logo__text {
		display: grid;
		line-height: 1;
	}
	.logo__word {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: calc(var(--logo-size) * 0.5);
		font-weight: 700;
		letter-spacing: 0.06em;
	}
	.logo__tag {
		margin-top: 3px;
		font-family: var(--font-display);
		font-size: calc(var(--logo-size) * 0.24);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--concrete-600);
	}
	.logo[data-tone='dark'] .logo__tag {
		color: var(--concrete-300);
	}
</style>
