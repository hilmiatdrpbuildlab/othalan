<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { mediaUrl } from '$lib/utils/image';
	import { formatBytes } from '$lib/utils/format';
	import { uploadMedia } from '$lib/cms/upload';
	import type { MediaInfo } from '$lib/cms/types';

	type Props = {
		open: boolean;
		kind?: 'image' | 'file';
		multiple?: boolean;
		onselect: (items: MediaInfo[]) => void;
		onclose: () => void;
	};
	let { open, kind = 'image', multiple = false, onselect, onclose }: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	let items = $state<MediaInfo[]>([]);
	let q = $state('');
	let loading = $state(false);
	let uploading = $state(0);
	let uploadError = $state('');
	let selected = $state<MediaInfo[]>([]);

	async function load() {
		loading = true;
		const res = await fetch(`/admin/medios/api?tipo=${kind}&q=${encodeURIComponent(q)}`);
		items = res.ok ? await res.json() : [];
		loading = false;
	}

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			selected = [];
			uploadError = '';
			dialog.showModal();
			load();
		}
		if (!open && dialog.open) dialog.close();
	});

	async function onFiles(files: FileList | null) {
		if (!files?.length) return;
		uploadError = '';
		const done: MediaInfo[] = [];
		for (const f of Array.from(files)) {
			uploading++;
			try {
				done.push(await uploadMedia(f, { folder: kind === 'image' ? 'general' : 'documentos' }));
			} catch (e) {
				uploadError = `${f.name}: ${(e as Error).message}`;
			} finally {
				uploading--;
			}
		}
		await load();
		if (done.length) selected = multiple ? [...selected, ...done] : [done[0]];
	}

	function toggle(m: MediaInfo) {
		const has = selected.some((s) => s.id === m.id);
		if (multiple) selected = has ? selected.filter((s) => s.id !== m.id) : [...selected, m];
		else selected = has ? [] : [m];
	}
	const accept = $derived(kind === 'image' ? 'image/jpeg,image/png,image/webp,image/avif,image/svg+xml' : 'application/pdf,image/*');
</script>

<dialog class="picker" bind:this={dialog} onclose={onclose} aria-label="Biblioteca de medios">
	<header class="picker__head">
		<h2 class="h4">{kind === 'image' ? 'Seleccionar imagen' : 'Seleccionar archivo'}</h2>
		<button type="button" class="icon-btn" onclick={onclose} aria-label="Cerrar"><Icon name="x" size={18} /></button>
	</header>
	<div class="picker__bar">
		<!-- Not a <form>: the picker is rendered inside the editor's form and nested forms break hydration. -->
		<div class="picker__search">
			<input
				class="input"
				type="search"
				placeholder="Buscar por nombre o texto alternativo (Enter)"
				bind:value={q}
				aria-label="Buscar"
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						load();
					}
				}}
			/>
		</div>
		<label class="btn btn--secondary btn--sm upload">
			<Icon name="upload" size={16} /> Subir {multiple ? 'archivos' : 'archivo'}
			<input type="file" {accept} multiple={multiple} onchange={(e) => onFiles(e.currentTarget.files)} />
		</label>
	</div>
	{#if uploading}<p class="alert alert--info"><span class="spinner"></span> Procesando y subiendo {uploading} archivo(s)…</p>{/if}
	{#if uploadError}<p class="alert alert--error">{uploadError}</p>{/if}
	<div class="picker__grid">
		{#if loading}
			<p class="muted">Cargando…</p>
		{:else if !items.length}
			<p class="muted">No hay archivos. Sube el primero.</p>
		{/if}
		{#each items as m (m.id)}
			{@const isSel = selected.some((s) => s.id === m.id)}
			<button type="button" class="tile" class:sel={isSel} onclick={() => toggle(m)} aria-pressed={isSel}>
				{#if m.mime.startsWith('image/')}
					<img src={mediaUrl(m.storageKey, { w: 320 })} alt="" loading="lazy" style:background-color={m.dominantColor ?? undefined} />
				{:else}
					<span class="tile__file"><Icon name="file-type-pdf" size={36} /></span>
				{/if}
				<span class="tile__name">{m.filename}</span>
				<span class="tile__meta mono">{formatBytes(m.bytes)}{#if m.mime.startsWith('image/') && !m.alt}&nbsp;· <span class="warn">sin alt</span>{/if}</span>
				{#if isSel}<span class="tile__check"><Icon name="check" size={16} /></span>{/if}
			</button>
		{/each}
	</div>
	<footer class="picker__foot">
		<span class="caption">{selected.length} seleccionado(s)</span>
		<div class="adm-actions">
			<button type="button" class="btn btn--ghost btn--sm" onclick={onclose}>Cancelar</button>
			<button type="button" class="btn btn--primary btn--sm" disabled={!selected.length} onclick={() => onselect(selected)}>Usar {multiple ? 'seleccionados' : 'archivo'}</button>
		</div>
	</footer>
</dialog>

<style>
	.picker {
		width: min(1000px, calc(100% - 24px));
		height: min(760px, calc(100% - 24px));
		padding: 0;
		border: 0;
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
	}
	.picker[open] {
		display: flex;
		flex-direction: column;
	}
	.picker::backdrop {
		background: rgb(11 13 12 / 0.6);
	}
	.picker__head,
	.picker__foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-5);
		border-bottom: 1px solid var(--concrete-200);
	}
	.picker__foot {
		border-top: 1px solid var(--concrete-200);
		border-bottom: 0;
	}
	.picker__head .icon-btn {
		width: 36px;
		height: 36px;
	}
	.picker__bar {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-5);
	}
	.picker__search {
		flex: 1;
	}
	.upload {
		position: relative;
		overflow: hidden;
	}
	.upload input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}
	.picker .alert {
		margin: 0 var(--space-5) var(--space-3);
	}
	.picker__grid {
		flex: 1;
		overflow-y: auto;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: var(--space-3);
		align-content: start;
		padding: var(--space-2) var(--space-5) var(--space-5);
	}
	.tile {
		position: relative;
		display: grid;
		gap: 4px;
		padding: 6px;
		border: 2px solid var(--concrete-200);
		border-radius: var(--radius-md);
		background: var(--white);
		text-align: left;
	}
	.tile.sel {
		border-color: var(--yellow-500);
		background: var(--yellow-50);
	}
	.tile img,
	.tile__file {
		width: 100%;
		aspect-ratio: 4/3;
		object-fit: cover;
		border-radius: var(--radius-sm);
	}
	.tile__file {
		display: grid;
		place-items: center;
		background: var(--copper-100);
		color: var(--copper-700);
	}
	.tile__name {
		font-size: 0.75rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tile__meta {
		font-size: 0.6875rem;
		color: var(--concrete-500);
	}
	.warn {
		color: var(--warning-600);
	}
	.tile__check {
		position: absolute;
		top: 10px;
		right: 10px;
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: var(--yellow-500);
	}
</style>
