<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { mediaUrl } from '$lib/utils/image';
	import { formatDate, formatNumber } from '$lib/utils/format';

	let { data } = $props();
	const m = $derived(data.meta);

	function cell(row: Record<string, unknown>, key: string): string {
		const v = row[key];
		if (v === null || v === undefined || v === '') return '—';
		const rel = data.relations[key]?.find((o) => o.value === v);
		if (rel) return rel.label;
		const field = m.fields.find((f) => f.name === key);
		const opt = field?.options?.find((o) => o.value === String(v));
		if (opt) return opt.label;
		if (field?.type === 'decimal') return formatNumber(v as string);
		return String(v);
	}
	const qs = (patch: Record<string, string | number | null>) => {
		const p = new URLSearchParams(page.url.searchParams);
		for (const [k, v] of Object.entries(patch)) {
			if (v === null || v === '') p.delete(k);
			else p.set(k, String(v));
		}
		const s = p.toString();
		return `?${s}`;
	};
</script>

<svelte:head><title>{m.label} | Panel Othalan</title></svelte:head>

<div class="adm-page-head">
	<div>
		<p class="eyebrow">{m.group}</p>
		<h1>{m.label}</h1>
		{#if m.description}<p>{m.description}</p>{/if}
	</div>
	{#if m.canWrite}
		<a href="/admin/c/{m.key}/nuevo" class="btn btn--primary"><Icon name="plus" size={16} /> Nuevo {m.singular}</a>
	{/if}
</div>

<div class="panel">
	<form class="filters-bar" method="GET" data-sveltekit-keepfocus>
		<label class="sr-only" for="q">Buscar</label>
		<input class="input" id="q" name="q" type="search" placeholder="Buscar…" value={data.q} />
		{#if m.hasStatus}
			<label class="sr-only" for="estado">Estado</label>
			<select class="select" id="estado" name="estado" value={data.status} onchange={(e) => e.currentTarget.form?.requestSubmit()}>
				<option value="">Todos los estados</option>
				<option value="published">Publicado</option>
				<option value="draft">Borrador</option>
			</select>
		{/if}
		<button class="btn btn--outline btn--sm"><Icon name="search" size={16} /> Buscar</button>
		{#if data.q || data.status}<a class="btn btn--ghost btn--sm" href="/admin/c/{m.key}">Limpiar</a>{/if}
	</form>

	{#if data.rows.length}
		<div class="table-wrap">
			<table class="table">
				<thead>
					<tr>
						{#each m.columns as c (c.key)}<th>{c.label}</th>{/each}
						<th class="actions-col"><span class="sr-only">Acciones</span></th>
					</tr>
				</thead>
				<tbody>
					{#each data.rows as row, i (row.id)}
						<tr>
							{#each m.columns as c, ci (c.key)}
								<td>
									{#if c.kind === 'image'}
										{@const md = data.media[row[c.key] as string]}
										{#if md}<img class="thumb" src={mediaUrl(md.storageKey, { w: 160 })} alt="" />{:else}<span class="thumb" style="display:inline-block"></span>{/if}
									{:else if c.kind === 'status'}
										<span class="status-dot" data-s={row[c.key]}>{row[c.key] === 'published' ? 'Publicado' : 'Borrador'}</span>
									{:else if c.kind === 'bool'}
										{#if row[c.key]}<Icon name="check" size={18} label="Sí" />{:else}<span class="muted">—</span>{/if}
									{:else if c.kind === 'date'}
										<span class="mono">{row[c.key] ? formatDate(row[c.key] as string) : '—'}</span>
									{:else if c.kind === 'badge'}
										{#if row[c.key]}<span class="badge">{cell(row, c.key)}</span>{:else}—{/if}
									{:else if ci === 0 || (m.columns[0].kind === 'image' && ci === 1)}
										<a class="row-link" href="/admin/c/{m.key}/{row.id}">{cell(row, c.key)}</a>
									{:else}
										<span class:mono={c.kind === 'mono'}>{cell(row, c.key)}</span>
									{/if}
								</td>
							{/each}
							<td class="actions-col">
								<div class="row-actions">
									{#if m.sortable && m.canWrite && !data.q}
										<form method="POST" action="?/move" use:enhance>
											<input type="hidden" name="id" value={row.id} />
											<button class="icon-btn mini" name="dir" value="up" disabled={i === 0 && data.page === 1} aria-label="Subir"><Icon name="arrow-up" size={14} /></button>
											<button class="icon-btn mini" name="dir" value="down" aria-label="Bajar"><Icon name="arrow-down" size={14} /></button>
										</form>
									{/if}
									{#if row._public}
										<a class="icon-btn mini" href={row._public as string} target="_blank" rel="noopener" aria-label="Ver en el sitio"><Icon name="external-link" size={14} /></a>
									{/if}
									<a class="icon-btn mini" href="/admin/c/{m.key}/{row.id}" aria-label="Editar"><Icon name="edit" size={14} /></a>
									{#if m.canWrite}
										<form method="POST" action="?/duplicate" use:enhance>
											<input type="hidden" name="id" value={row.id} />
											<button class="icon-btn mini" aria-label="Duplicar"><Icon name="copy" size={14} /></button>
										</form>
										<form
											method="POST"
											action="?/delete"
											use:enhance={({ cancel }) => {
												if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer desde el panel.')) cancel();
											}}
										>
											<input type="hidden" name="id" value={row.id} />
											<button class="icon-btn mini danger" aria-label="Eliminar"><Icon name="trash" size={14} /></button>
										</form>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="pager-adm">
			<span>{data.total} registro(s)</span>
			{#if data.pages > 1}
				<span class="adm-actions">
					{#if data.page > 1}<a class="btn btn--outline btn--sm" href={qs({ pagina: data.page - 1 })}>Anterior</a>{/if}
					<span class="mono">{data.page} / {data.pages}</span>
					{#if data.page < data.pages}<a class="btn btn--outline btn--sm" href={qs({ pagina: data.page + 1 })}>Siguiente</a>{/if}
				</span>
			{/if}
		</div>
	{:else}
		<div class="empty-state">
			<Icon name={m.icon} size={40} />
			<p>{data.q || data.status ? 'No hay resultados con estos filtros.' : `Aún no hay ${m.label.toLowerCase()}.`}</p>
			{#if m.canWrite && !data.q}<a href="/admin/c/{m.key}/nuevo" class="btn btn--primary btn--sm"><Icon name="plus" size={14} /> Crear el primero</a>{/if}
		</div>
	{/if}
</div>

<style>
	.actions-col {
		width: 1%;
		white-space: nowrap;
	}
	.row-actions {
		display: flex;
		gap: 4px;
		justify-content: flex-end;
	}
	.row-actions form {
		display: flex;
		gap: 4px;
	}
	:global(.icon-btn.mini) {
		width: 30px;
		height: 30px;
	}
	:global(.icon-btn.mini:disabled) {
		opacity: 0.35;
		pointer-events: none;
	}
	:global(.icon-btn.danger:hover) {
		background: var(--error-600) !important;
		border-color: var(--error-600) !important;
		color: var(--white) !important;
	}
</style>
