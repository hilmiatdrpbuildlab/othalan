<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { formatDateTime } from '$lib/utils/format';
	import { AUDIT_ACTIONS } from '$lib/site-config';

	let { data } = $props();
	const ACTIONS = AUDIT_ACTIONS;
	const href = (p: number) => `?pagina=${p}${data.entity ? `&entidad=${data.entity}` : ''}${data.q ? `&q=${encodeURIComponent(data.q)}` : ''}`;
</script>

<svelte:head><title>Auditoría | Panel Othalan</title></svelte:head>

<div class="adm-page-head">
	<div>
		<p class="eyebrow">Administración</p>
		<h1>Registro de auditoría</h1>
		<p>Quién hizo qué y cuándo. Las IP no se guardan.</p>
	</div>
</div>

<div class="panel">
	<form class="filters-bar" method="GET">
		<select class="select" name="entidad" value={data.entity} aria-label="Sección" onchange={(e) => e.currentTarget.form?.requestSubmit()}>
			<option value="">Todas las secciones</option>
			{#each data.entities as e (e)}<option value={e}>{e}</option>{/each}
		</select>
		<input class="input" type="search" name="q" placeholder="Usuario…" value={data.q} aria-label="Usuario" />
		<button class="btn btn--outline btn--sm"><Icon name="search" size={14} /> Filtrar</button>
	</form>
	<div class="table-wrap">
		<table class="table">
			<thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Sección</th><th>Detalle</th></tr></thead>
			<tbody>
				{#each data.rows as r (r.id)}
					<tr>
						<td class="mono">{formatDateTime(r.createdAt)}</td>
						<td>{r.userName ?? 'Sistema'}</td>
						<td><span class="badge">{ACTIONS[r.action] ?? r.action}</span></td>
						<td class="mono">{r.entity}</td>
						<td>{r.summary ?? ''}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="pager-adm">
		<span>{data.total} evento(s)</span>
		{#if data.pages > 1}
			<span class="adm-actions">
				{#if data.page > 1}<a class="btn btn--outline btn--sm" href={href(data.page - 1)}>Anterior</a>{/if}
				<span class="mono">{data.page} / {data.pages}</span>
				{#if data.page < data.pages}<a class="btn btn--outline btn--sm" href={href(data.page + 1)}>Siguiente</a>{/if}
			</span>
		{/if}
	</div>
</div>
