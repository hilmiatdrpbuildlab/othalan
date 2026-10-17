<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { mediaUrl } from '$lib/utils/image';
	import type { PublicMedia } from '$lib/types';

	type Item = { media: PublicMedia; caption?: string | null };
	let { items, index = $bindable(-1) }: { items: Item[]; index?: number } = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	let touchX = 0;
	const current = $derived(index >= 0 ? items[index] : null);

	$effect(() => {
		if (!dialog) return;
		if (index >= 0 && !dialog.open) dialog.showModal();
		if (index < 0 && dialog.open) dialog.close();
	});
	// Prefetch neighbours
	$effect(() => {
		if (index < 0) return;
		for (const i of [index - 1, index + 1]) {
			const it = items[(i + items.length) % items.length];
			if (it) new Image().src = mediaUrl(it.media.storageKey, { w: 1920 });
		}
	});

	const go = (d: number) => (index = (index + d + items.length) % items.length);
	function onKey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') go(1);
		if (e.key === 'ArrowLeft') go(-1);
	}
</script>

<dialog
	bind:this={dialog}
	class="lb"
	aria-label="Galería de imágenes"
	onclose={() => (index = -1)}
	onkeydown={onKey}
	ontouchstart={(e) => (touchX = e.touches[0].clientX)}
	ontouchend={(e) => {
		const dx = e.changedTouches[0].clientX - touchX;
		if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
	}}
>
	{#if current}
		<figure>
			<img src={mediaUrl(current.media.storageKey, { w: 1920 })} alt={current.media.alt} />
			<figcaption>
				<span>{current.caption || current.media.caption || ''}</span>
				<span class="mono">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
			</figcaption>
		</figure>
	{/if}
	<button class="lb__btn lb__close" type="button" onclick={() => (index = -1)} aria-label="Cerrar"><Icon name="x" size={24} /></button>
	{#if items.length > 1}
		<button class="lb__btn lb__prev" type="button" onclick={() => go(-1)} aria-label="Imagen anterior"><Icon name="chevron-left" size={28} /></button>
		<button class="lb__btn lb__next" type="button" onclick={() => go(1)} aria-label="Siguiente imagen"><Icon name="chevron-right" size={28} /></button>
	{/if}
</dialog>

<style>
	.lb {
		width: 100%;
		max-width: none;
		height: 100%;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: rgb(11 13 12 / 0.96);
		color: var(--white);
	}
	.lb[open] {
		display: grid;
		place-items: center;
	}
	.lb::backdrop {
		background: transparent;
	}
	figure {
		display: grid;
		gap: var(--space-3);
		max-width: min(1600px, 92vw);
	}
	img {
		max-height: 82vh;
		width: auto;
		margin-inline: auto;
		border-radius: var(--radius-md);
	}
	figcaption {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		font-size: var(--text-body-sm);
		color: var(--concrete-300);
	}
	.lb__btn {
		position: fixed;
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 1px solid rgb(255 255 255 / 0.2);
		background: rgb(21 24 26 / 0.7);
		color: var(--white);
	}
	@media (hover: hover) {
		.lb__btn:hover {
			background: var(--yellow-500);
			color: var(--carbon-950);
		}
	}
	.lb__btn:focus-visible {
		outline: 2px solid var(--yellow-300);
	}
	.lb__close {
		top: 16px;
		right: 16px;
	}
	.lb__prev {
		left: 16px;
		top: 50%;
	}
	.lb__next {
		right: 16px;
		top: 50%;
	}
</style>
