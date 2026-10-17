<script lang="ts">
	import { mediaUrl, srcset, type ImageRef } from '$lib/utils/image';

	type Props = {
		media: ImageRef | null | undefined;
		ratio?: string;
		sizes?: string;
		priority?: boolean;
		alt?: string;
		class?: string;
		fit?: 'cover' | 'contain';
		/** default render width when transforms are on */
		width?: number;
	};
	let { media, ratio, sizes = '100vw', priority = false, alt, class: className = '', fit = 'cover', width = 1440 }: Props = $props();

	const pos = $derived(media ? `${Math.round((media.focalX ?? 0.5) * 100)}% ${Math.round((media.focalY ?? 0.5) * 100)}%` : '50% 50%');
	const src = $derived(media ? mediaUrl(media.storageKey, { w: width }) : '');
	const set = $derived(media ? srcset(media) : undefined);
	const aspect = $derived(ratio ?? (media?.width && media?.height ? `${media.width}/${media.height}` : undefined));
</script>

{#if media}
	<span class="img {className}" style:aspect-ratio={aspect} style:background-color={media.dominantColor ?? 'var(--concrete-100)'}>
		<img
			{src}
			srcset={set}
			sizes={set ? sizes : undefined}
			alt={alt ?? media.alt ?? ''}
			width={media.width ?? undefined}
			height={media.height ?? undefined}
			loading={priority ? 'eager' : 'lazy'}
			fetchpriority={priority ? 'high' : 'auto'}
			decoding={priority ? 'sync' : 'async'}
			style:object-position={pos}
			style:object-fit={fit}
		/>
	</span>
{:else}
	<span class="img img--empty {className}" style:aspect-ratio={ratio} aria-hidden="true"></span>
{/if}

<style>
	.img {
		position: relative;
		display: block;
		overflow: hidden;
		width: 100%;
	}
	.img img {
		width: 100%;
		height: 100%;
	}
	.img--empty {
		background:
			repeating-linear-gradient(135deg, transparent 0 12px, rgb(21 24 26 / 0.04) 12px 13px),
			var(--concrete-100);
	}
</style>
