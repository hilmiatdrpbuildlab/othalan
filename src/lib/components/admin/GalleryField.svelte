<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import MediaPicker from './MediaPicker.svelte';
	import { mediaUrl } from '$lib/utils/image';
	import type { MediaInfo } from '$lib/cms/types';

	type Item = { mediaId: string; caption?: string };
	type Props = { name: string; id: string; value: Item[]; media: Record<string, MediaInfo> };
	let { name, id, value = $bindable([]), media = $bindable({}) }: Props = $props();
	let open = $state(false);
	let dragIndex = $state(-1);

	function move(from: number, to: number) {
		if (to < 0 || to >= value.length) return;
		const next = [...value];
		const [it] = next.splice(from, 1);
		next.splice(to, 0, it);
		value = next;
	}
</script>

<input type="hidden" {name} value={JSON.stringify(value)} />
<div class="gal">
	{#if value.length}
		<ol class="gal__list">
			{#each value as item, i (item.mediaId + i)}
				{@const m = media[item.mediaId]}
				<li
					draggable="true"
					class:dragging={dragIndex === i}
					ondragstart={() => (dragIndex = i)}
					ondragover={(e) => e.preventDefault()}
					ondrop={() => {
						move(dragIndex, i);
						dragIndex = -1;
					}}
					ondragend={() => (dragIndex = -1)}
				>
					<span class="gal__grip" aria-hidden="true"><Icon name="grip-vertical" size={16} /></span>
					{#if m}<img src={mediaUrl(m.storageKey, { w: 240 })} alt="" />{/if}
					<div class="gal__meta">
						<input class="input" placeholder="Leyenda (opcional)" aria-label="Leyenda de la imagen {i + 1}" bind:value={item.caption} maxlength="200" />
						{#if m && !m.alt}<span class="badge badge--warning">Sin texto alternativo</span>{/if}
					</div>
					<div class="gal__btns">
						<button type="button" class="icon-btn mini" onclick={() => move(i, i - 1)} disabled={i === 0} aria-label="Mover antes"><Icon name="arrow-up" size={14} /></button>
						<button type="button" class="icon-btn mini" onclick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label="Mover después"><Icon name="arrow-down" size={14} /></button>
						<button type="button" class="icon-btn mini danger" onclick={() => (value = value.filter((_, k) => k !== i))} aria-label="Quitar imagen"><Icon name="trash" size={14} /></button>
					</div>
				</li>
			{/each}
		</ol>
	{/if}
	<button {id} type="button" class="btn btn--outline btn--sm" onclick={() => (open = true)}><Icon name="plus" size={16} /> Agregar fotos</button>
	<span class="caption">{value.length} foto(s) · arrastra para reordenar</span>
</div>

<MediaPicker
	{open}
	kind="image"
	multiple
	onclose={() => (open = false)}
	onselect={(items) => {
		for (const m of items) media[m.id] = m;
		value = [...value, ...items.filter((m) => !value.some((v) => v.mediaId === m.id)).map((m) => ({ mediaId: m.id }))];
		open = false;
	}}
/>

<style>
	.gal {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
	}
	.gal__list {
		list-style: none;
		padding: 0;
		width: 100%;
		display: grid;
		gap: var(--space-2);
	}
	.gal__list li {
		display: grid;
		grid-template-columns: auto 96px 1fr auto;
		gap: var(--space-3);
		align-items: center;
		padding: var(--space-2);
		background: var(--white);
		border: 1px solid var(--concrete-200);
		border-radius: var(--radius-md);
	}
	.gal__list li.dragging {
		opacity: 0.4;
	}
	.gal__grip {
		cursor: grab;
		color: var(--concrete-400);
	}
	.gal__list img {
		width: 96px;
		height: 72px;
		object-fit: cover;
		border-radius: var(--radius-sm);
	}
	.gal__meta {
		display: grid;
		gap: 4px;
	}
	.gal__btns {
		display: flex;
		gap: 4px;
	}
</style>
