<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import MediaPicker from './MediaPicker.svelte';
	import { mediaUrl } from '$lib/utils/image';
	import { formatBytes } from '$lib/utils/format';
	import type { MediaInfo } from '$lib/cms/types';

	type Props = { name: string; id: string; value: string | null; mediaMap: Record<string, MediaInfo>; kind?: 'image' | 'file'; invalid?: boolean };
	let { name, id, value = $bindable(), mediaMap = $bindable(), kind = 'image', invalid = false }: Props = $props();
	let open = $state(false);
	const media = $derived(value ? (mediaMap[value] ?? null) : null);
</script>

<input type="hidden" {name} value={value ?? ''} />
<div class="mf" class:mf--invalid={invalid}>
	{#if value && media}
		{#if media.mime.startsWith('image/')}
			<img src={mediaUrl(media.storageKey, { w: 480 })} alt="" style:background-color={media.dominantColor ?? undefined} />
		{:else}
			<span class="mf__file"><Icon name="file-type-pdf" size={32} /></span>
		{/if}
		<div class="mf__info">
			<strong>{media.filename}</strong>
			<span class="mono caption">{formatBytes(media.bytes)}{#if media.width}&nbsp;· {media.width}×{media.height}px{/if}</span>
			{#if media.mime.startsWith('image/')}
				{#if media.alt}<span class="caption">Alt: {media.alt}</span>{:else}<span class="badge badge--warning">Sin texto alternativo</span>{/if}
			{/if}
			<div class="adm-actions">
				<button {id} type="button" class="btn btn--outline btn--sm" onclick={() => (open = true)}>Cambiar</button>
				<a class="btn btn--ghost btn--sm" href="/admin/medios/{media.id}" target="_blank">Editar alt / punto focal</a>
				<button
					type="button"
					class="btn btn--ghost btn--sm"
					onclick={() => (value = null)}>Quitar</button
				>
			</div>
		</div>
	{:else}
		<button {id} type="button" class="mf__empty" onclick={() => (open = true)}>
			<Icon name={kind === 'image' ? 'photo' : 'file'} size={28} />
			<span>{kind === 'image' ? 'Seleccionar o subir imagen' : 'Seleccionar o subir archivo'}</span>
		</button>
	{/if}
</div>

<MediaPicker
	{open}
	{kind}
	onclose={() => (open = false)}
	onselect={(items) => {
		mediaMap[items[0].id] = items[0];
		value = items[0].id;
		open = false;
	}}
/>

<style>
	.mf {
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
		padding: var(--space-3);
		border: 1px solid var(--concrete-300);
		border-radius: var(--radius-md);
		background: var(--white);
	}
	.mf--invalid {
		border-color: var(--error-600);
		box-shadow: 0 0 0 1px var(--error-600);
	}
	.mf img,
	.mf__file {
		width: 160px;
		aspect-ratio: 4/3;
		object-fit: cover;
		border-radius: var(--radius-sm);
		flex: none;
	}
	.mf__file {
		display: grid;
		place-items: center;
		background: var(--copper-100);
		color: var(--copper-700);
	}
	.mf__info {
		display: grid;
		gap: 4px;
		min-width: 0;
	}
	.mf__info strong {
		overflow-wrap: anywhere;
	}
	.mf__empty {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		justify-content: center;
		width: 100%;
		min-height: 96px;
		border: 2px dashed var(--concrete-300);
		border-radius: var(--radius-md);
		background: var(--concrete-25);
		color: var(--concrete-600);
	}
	.mf__empty:hover {
		border-color: var(--yellow-600);
		background: var(--yellow-50);
	}
	.mf:has(.mf__empty) {
		padding: 0;
		border: 0;
	}
</style>
