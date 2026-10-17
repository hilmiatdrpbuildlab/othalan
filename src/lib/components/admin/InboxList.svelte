<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { formatDate } from '$lib/utils/format';

	type Row = { id: string; status: string; createdAt: Date | string; primary: string; secondary?: string | null; extra?: string | null };
	type Props = {
		base: string;
		rows: Row[];
		statuses: Record<string, string>;
		current: string;
		q: string;
		newStatus: string;
		columns: [string, string, string];
		emptyIcon?: string;
	};
	let { base, rows, statuses, current, q, newStatus, columns, emptyIcon = 'inbox' }: Props = $props();
</script>

<nav class="tabs" aria-label="Filtrar por estado">
	<a href={base} class:on={!current}>Todos</a>
	{#each Object.entries(statuses) as [k, l] (k)}<a href="{base}?estado={k}" class:on={current === k}>{l}</a>{/each}
</nav>

<div class="panel">
	<form class="filters-bar" method="GET">
		{#if current}<input type="hidden" name="estado" value={current} />{/if}
		<input class="input" type="search" name="q" placeholder="Buscar…" value={q} aria-label="Buscar" />
		<button class="btn btn--outline btn--sm"><Icon name="search" size={14} /> Buscar</button>
	</form>
	{#if rows.length}
		<div class="table-wrap">
			<table class="table">
				<thead><tr><th>{columns[0]}</th><th>{columns[1]}</th><th>{columns[2]}</th><th>Estado</th><th>Fecha</th></tr></thead>
				<tbody>
					{#each rows as r (r.id)}
						<tr class:unread={r.status === newStatus}>
							<td><a class="row-link" href="{base}/{r.id}">{r.primary}</a></td>
							<td>{r.secondary ?? '—'}</td>
							<td class="clip">{r.extra ?? '—'}</td>
							<td><span class="badge" class:badge--brand={r.status === newStatus}>{statuses[r.status] ?? r.status}</span></td>
							<td class="mono">{formatDate(r.createdAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="empty-state"><Icon name={emptyIcon} size={40} /><p>No hay registros.</p></div>
	{/if}
</div>

<style>
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.tabs a {
		padding: 6px 14px;
		border: 1px solid var(--concrete-300);
		border-radius: var(--radius-full);
		background: var(--white);
		font-size: 0.8125rem;
		text-decoration: none;
	}
	.tabs a.on {
		background: var(--carbon-900);
		border-color: var(--carbon-900);
		color: var(--white);
	}
	.clip {
		max-width: 360px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
