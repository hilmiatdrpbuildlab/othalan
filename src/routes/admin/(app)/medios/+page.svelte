<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import { mediaUrl } from '$lib/utils/image';
	import { formatBytes } from '$lib/utils/format';
	import { uploadMedia } from '$lib/cms/upload';

	let { data } = $props();
	let queue = $state<{ name: string; status: 'pending' | 'done' | 'error'; msg?: string }[]>([]);
	let dragging = $state(false);
	let folder = $state('general');

	async function upload(files: FileList | File[] | null) {
		if (!files) return;
		const list = Array.from(files);
		queue = [...queue, ...list.map((f) => ({ name: f.name, status: 'pending' as const }))];
		for (const f of list) {
			const item = queue.find((q) => q.name === f.name && q.status === 'pending')!;
			try {
				await uploadMedia(f, { folder });
				item.status = 'done';
			} catch (e) {
				item.status = 'error';
				item.msg = (e as Error).message;
			}
		}
		await invalidateAll();
		setTimeout(() => (queue = queue.filter((q) => q.status === 'error')), 2500);
	}
</script>

<svelte:head><title>Medios | Panel Othalan</title></svelte:head>
<Toast />

<div class="adm-page-head">
	<div>
		<p class="eyebrow">Sitio</p>
		<h1>Biblioteca de medios</h1>
		<p>Las imágenes se optimizan automáticamente (máx. 2560 px, WebP, sin datos EXIF/GPS). Completa siempre el texto alternativo.</p>
	</div>
</div>

{#if data.canWrite}
	<div
		class="drop panel"
		class:over={dragging}
		role="region"
		aria-label="Subir archivos"
		ondragover={(e) => {
			e.preventDefault();
			dragging = true;
		}}
		ondragleave={() => (dragging = false)}
		ondrop={(e) => {
			e.preventDefault();
			dragging = false;
			upload(e.dataTransfer?.files ?? null);
		}}
	>
		<Icon name="upload" size={32} />
		<p><strong>Arrastra fotos o PDF aquí</strong> o</p>
		<label class="btn btn--secondary btn--sm pick">
			Seleccionar archivos
			<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,application/pdf" onchange={(e) => upload(e.currentTarget.files)} />
		</label>
		<label class="caption">Carpeta:
			<select class="select fold" bind:value={folder}>
				{#each [...new Set(['general', 'proyectos', 'equipo', 'clientes', 'documentos', ...data.folders])] as f (f)}<option value={f}>{f}</option>{/each}
			</select>
		</label>
		{#if queue.length}
			<ul class="queue">
				{#each queue as q, i (q.name + i)}
					<li class={q.status}>
						{#if q.status === 'pending'}<span class="spinner"></span>{:else if q.status === 'done'}<Icon name="check" size={16} />{:else}<Icon name="alert-circle" size={16} />{/if}
						{q.name}{#if q.msg}: {q.msg}{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<div class="panel">
	<form class="filters-bar" method="GET">
		<input class="input" type="search" name="q" placeholder="Buscar…" value={data.filters.q} aria-label="Buscar" />
		<select class="select" name="carpeta" value={data.filters.folder} aria-label="Carpeta" onchange={(e) => e.currentTarget.form?.requestSubmit()}>
			<option value="">Todas las carpetas</option>
			{#each data.folders as f (f)}<option value={f}>{f}</option>{/each}
		</select>
		<select class="select" name="tipo" value={data.filters.tipo} aria-label="Tipo" onchange={(e) => e.currentTarget.form?.requestSubmit()}>
			<option value="">Todos los tipos</option>
			<option value="image">Imágenes</option>
			<option value="pdf">PDF</option>
		</select>
		<label class="check"><input type="checkbox" name="sin_alt" value="1" checked={data.filters.sinAlt} onchange={(e) => e.currentTarget.form?.requestSubmit()} /> Sin texto alternativo</label>
		<button class="btn btn--outline btn--sm">Filtrar</button>
	</form>
	{#if data.items.length}
		<ul class="grid">
			{#each data.items as m (m.id)}
				<li>
					<a href="/admin/medios/{m.id}" class="tile">
						{#if m.mime.startsWith('image/')}
							<img src={mediaUrl(m.storageKey, { w: 320 })} alt={m.alt} loading="lazy" style:background-color={m.dominantColor ?? undefined} style:object-position="{m.focalX * 100}% {m.focalY * 100}%" />
						{:else}
							<span class="file"><Icon name="file-type-pdf" size={36} /></span>
						{/if}
						<span class="name">{m.filename}</span>
						<span class="meta mono">
							{formatBytes(m.bytes)}{#if m.width}&nbsp;· {m.width}×{m.height}{/if}
						</span>
						{#if m.mime.startsWith('image/') && !m.alt}<span class="badge badge--warning noalt">Sin alt</span>{/if}
					</a>
				</li>
			{/each}
		</ul>
		<div class="pager-adm">
			<span>{data.total} archivo(s)</span>
			{#if data.pages > 1}
				<span class="adm-actions">
					{#if data.page > 1}<a class="btn btn--outline btn--sm" href="?pagina={data.page - 1}">Anterior</a>{/if}
					<span class="mono">{data.page} / {data.pages}</span>
					{#if data.page < data.pages}<a class="btn btn--outline btn--sm" href="?pagina={data.page + 1}">Siguiente</a>{/if}
				</span>
			{/if}
		</div>
	{:else}
		<div class="empty-state"><Icon name="photo" size={40} /><p>No hay archivos con estos filtros.</p></div>
	{/if}
</div>

<style>
	.drop {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--space-3) var(--space-4);
		margin-bottom: var(--space-6);
		padding: var(--space-6);
		border: 2px dashed var(--concrete-300);
		text-align: center;
	}
	.drop.over {
		border-color: var(--yellow-600);
		background: var(--yellow-50);
	}
	.pick {
		position: relative;
		overflow: hidden;
	}
	.pick input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}
	.fold {
		width: auto;
		min-height: 32px !important;
		padding-block: 4px !important;
		margin-left: 6px;
	}
	.queue {
		width: 100%;
		list-style: none;
		padding: 0;
		display: grid;
		gap: 4px;
		font-size: 0.8125rem;
		text-align: left;
	}
	.queue li {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.queue .done {
		color: var(--success-600);
	}
	.queue .error {
		color: var(--error-600);
	}
	.grid {
		list-style: none;
		padding: var(--space-4);
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
		gap: var(--space-3);
	}
	.tile {
		position: relative;
		display: grid;
		gap: 4px;
		padding: 6px;
		border: 1px solid var(--concrete-200);
		border-radius: var(--radius-md);
		background: var(--white);
		text-decoration: none;
	}
	.tile:hover {
		border-color: var(--carbon-900);
	}
	.tile img,
	.file {
		width: 100%;
		aspect-ratio: 4/3;
		object-fit: cover;
		border-radius: var(--radius-sm);
	}
	.file {
		display: grid;
		place-items: center;
		background: var(--copper-100);
		color: var(--copper-700);
	}
	.name {
		font-size: 0.75rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.meta {
		font-size: 0.6875rem;
		color: var(--concrete-500);
	}
	.noalt {
		position: absolute;
		top: 12px;
		left: 12px;
	}
</style>
