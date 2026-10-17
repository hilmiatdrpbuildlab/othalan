<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import { RFQ_STATUS } from '$lib/site-config';
	import { REGIONES } from '$lib/utils/chile';
	import { formatDate } from '$lib/utils/format';

	let { data } = $props();
	const f = $derived(data.filters);
	const tone: Record<string, string> = {
		nueva: 'brand',
		en_revision: 'info',
		visita_tecnica: 'info',
		cotizada: 'accent',
		adjudicada: 'success',
		no_adjudicada: 'error'
	};
	const exportHref = $derived(`/admin/cotizaciones/exportar${page.url.search}`);
	const pageHref = (p: number) => {
		const q = new URLSearchParams(page.url.searchParams);
		q.set('pagina', String(p));
		return `?${q}`;
	};
</script>

<svelte:head><title>Cotizaciones | Panel Othalan</title></svelte:head>
<Toast />

<div class="adm-page-head">
	<div>
		<p class="eyebrow">Bandeja</p>
		<h1>Solicitudes de cotización</h1>
		<p>Meta de respuesta: menos de 24 horas hábiles.</p>
	</div>
	<a href={exportHref} class="btn btn--outline btn--sm"><Icon name="download" size={14} /> Exportar CSV</a>
</div>

<nav class="pipeline" aria-label="Filtrar por estado">
	<a href="/admin/cotizaciones" class:on={!f.status}>Todas</a>
	{#each Object.entries(RFQ_STATUS) as [k, label] (k)}
		<a href="?estado={k}" class:on={f.status === k}>{label} <span class="mono">{data.counts[k] ?? 0}</span></a>
	{/each}
</nav>

<div class="panel">
	<form class="filters-bar" method="GET">
		{#if f.status}<input type="hidden" name="estado" value={f.status} />{/if}
		<input class="input" type="search" name="q" placeholder="Ticket, nombre, empresa o correo" value={f.q} aria-label="Buscar" />
		<select class="select" name="servicio" value={f.service} aria-label="Servicio">
			<option value="">Todos los servicios</option>
			{#each data.services as s (s.id)}<option value={s.id}>{s.title}</option>{/each}
		</select>
		<select class="select" name="region" value={f.region} aria-label="Región">
			<option value="">Todas las regiones</option>
			{#each REGIONES as r (r)}<option value={r}>{r}</option>{/each}
		</select>
		<label class="caption">Desde <input class="input" type="date" name="desde" value={f.desde} /></label>
		<button class="btn btn--outline btn--sm"><Icon name="search" size={14} /> Filtrar</button>
	</form>
	{#if data.rows.length}
		<div class="table-wrap">
			<table class="table">
				<thead><tr><th>Ticket</th><th>Contacto</th><th>Servicio</th><th>Región</th><th>Responsable</th><th>Estado</th><th>Recibida</th></tr></thead>
				<tbody>
					{#each data.rows as r (r.id)}
						<tr class:unread={r.status === 'nueva'}>
							<td><a class="row-link mono" href="/admin/cotizaciones/{r.id}">{r.ticketCode}</a></td>
							<td>{r.contactName}{#if r.company}<br /><small class="muted">{r.company}</small>{/if}</td>
							<td>{r.serviceLabel ?? '—'}</td>
							<td>{r.region ?? '—'}</td>
							<td>{r.assignee ?? '—'}</td>
							<td><span class="badge badge--{tone[r.status]}">{RFQ_STATUS[r.status]}</span></td>
							<td class="mono">{formatDate(r.createdAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="pager-adm">
			<span>{data.total} solicitud(es)</span>
			{#if data.pages > 1}
				<span class="adm-actions">
					{#if data.page > 1}<a class="btn btn--outline btn--sm" href={pageHref(data.page - 1)}>Anterior</a>{/if}
					<span class="mono">{data.page} / {data.pages}</span>
					{#if data.page < data.pages}<a class="btn btn--outline btn--sm" href={pageHref(data.page + 1)}>Siguiente</a>{/if}
				</span>
			{/if}
		</div>
	{:else}
		<div class="empty-state"><Icon name="inbox" size={40} /><p>No hay solicitudes con estos filtros.</p></div>
	{/if}
</div>

<style>
	.pipeline {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.pipeline a {
		display: inline-flex;
		gap: 8px;
		align-items: center;
		padding: 6px 14px;
		border: 1px solid var(--concrete-300);
		border-radius: var(--radius-full);
		background: var(--white);
		font-size: 0.8125rem;
		font-weight: 500;
		text-decoration: none;
	}
	.pipeline a.on {
		background: var(--carbon-900);
		border-color: var(--carbon-900);
		color: var(--white);
	}
	.pipeline .mono {
		font-size: 0.75rem;
		opacity: 0.7;
	}
	.filters-bar label.caption {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
</style>
