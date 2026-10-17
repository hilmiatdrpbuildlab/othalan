<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { AUDIT_ACTIONS, RFQ_STATUS } from '$lib/site-config';
	import { formatDate, formatDateTime } from '$lib/utils/format';

	let { data } = $props();
	const hour = new Date().getHours();
	const greet = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
	const cards = $derived(
		[
			{ label: 'Cotizaciones nuevas', value: data.rfqNew, sub: `${data.rfqWeek} en los últimos 7 días`, href: '/admin/cotizaciones?estado=nueva', icon: 'clipboard-list', show: true },
			{ label: 'Mensajes sin leer', value: data.msgNew, sub: 'Formulario de contacto', href: '/admin/mensajes', icon: 'message', show: true },
			{ label: 'Postulaciones nuevas', value: data.appsNew, sub: 'Trabaja con nosotros', href: '/admin/postulaciones', icon: 'id-badge-2', show: true },
			{ label: 'Contenidos en borrador', value: data.drafts, sub: 'Proyectos, servicios y noticias', href: '/admin/c/proyectos?estado=draft', icon: 'edit', show: true }
		].filter((c) => c.show)
	);
	const pending = $derived(data.checklist.filter((c) => !c.ok));
</script>

<div class="adm-page-head">
	<div>
		<h1>{greet}, {data.user.name.split(' ')[0]}</h1>
		<p>Resumen de la actividad del sitio.</p>
	</div>
	<div class="adm-actions">
		<a href="/admin/c/proyectos/nuevo" class="btn btn--primary"><Icon name="plus" size={16} /> Nuevo proyecto</a>
		<a href="/admin/medios" class="btn btn--outline"><Icon name="upload" size={16} /> Subir fotos</a>
	</div>
</div>

<div class="cards">
	{#each cards as c (c.label)}
		<a href={c.href} class="panel stat">
			<span class="stat__icon"><Icon name={c.icon} size={22} /></span>
			<span class="stat__value">{c.value}</span>
			<span class="stat__label">{c.label}</span>
			<span class="caption">{c.sub}</span>
		</a>
	{/each}
</div>

<div class="cols">
	<section class="panel">
		<div class="panel__head">
			<h2>Últimas cotizaciones</h2>
			<a href="/admin/cotizaciones" class="link-arrow">Ver todas <Icon name="arrow-right" size={14} /></a>
		</div>
		{#if data.recentRfq.length}
			<div class="table-wrap">
				<table class="table">
					<thead><tr><th>Ticket</th><th>Cliente</th><th>Servicio</th><th>Estado</th><th>Fecha</th></tr></thead>
					<tbody>
						{#each data.recentRfq as r (r.id)}
							<tr class:unread={r.status === 'nueva'}>
								<td><a class="row-link mono" href="/admin/cotizaciones/{r.id}">{r.ticketCode}</a></td>
								<td>{r.company || r.contactName}</td>
								<td>{r.serviceLabel}</td>
								<td><span class="badge" class:badge--brand={r.status === 'nueva'}>{RFQ_STATUS[r.status]}</span></td>
								<td class="mono">{formatDate(r.createdAt)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="empty-state"><Icon name="inbox" size={36} /><p>Aún no hay solicitudes de cotización.</p></div>
		{/if}
	</section>

	<div class="stack-col">
		{#if pending.length}
			<section class="panel">
				<div class="panel__head"><h2>Antes del lanzamiento</h2><span class="badge badge--warning">{pending.length} pendientes</span></div>
				<ul class="check-list">
					{#each data.checklist as c (c.label)}
						<li class:ok={c.ok}>
							<Icon name={c.ok ? 'circle-check' : 'alert-triangle'} size={18} />
							{#if c.ok}<span>{c.label}</span>{:else}<a href={c.href}>{c.label}</a>{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}
		{#if data.expiring.length}
			<section class="panel">
				<div class="panel__head"><h2>Certificados por vencer</h2></div>
				<ul class="check-list">
					{#each data.expiring as c (c.id)}
						<li><Icon name="certificate" size={18} /><a href="/admin/c/certificaciones/{c.id}">{c.name}</a><span class="mono caption">{formatDate(c.expiresAt)}</span></li>
					{/each}
				</ul>
			</section>
		{/if}
		{#if data.activity.length}
			<section class="panel">
				<div class="panel__head"><h2>Actividad reciente</h2><a href="/admin/auditoria" class="link-arrow">Ver todo</a></div>
				<ul class="activity">
					{#each data.activity as a (a.id)}
						<li>
							<span class="caption mono">{formatDateTime(a.createdAt)}</span>
							<span><strong>{a.userName?.split(' <')[0] ?? 'Sistema'}</strong> · {AUDIT_ACTIONS[a.action] ?? a.action} · {a.entity}{#if a.summary}: {a.summary}{/if}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
</div>

<style>
	.cards {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		margin-bottom: var(--space-6);
	}
	.stat {
		display: grid;
		gap: 2px;
		padding: var(--space-5);
		text-decoration: none;
		transition: box-shadow var(--duration-fast), border-color var(--duration-fast);
	}
	.stat:hover {
		box-shadow: var(--shadow-md);
		border-color: var(--concrete-300);
	}
	.stat__icon {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		margin-bottom: var(--space-3);
		border-radius: var(--radius-md);
		background: var(--yellow-100);
	}
	.stat__value {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 800;
		line-height: 1;
	}
	.stat__label {
		font-weight: 600;
	}
	.cols {
		display: grid;
		gap: var(--space-6);
		align-items: start;
	}
	@media (min-width: 1100px) {
		.cols {
			grid-template-columns: 3fr 2fr;
		}
	}
	.stack-col {
		display: grid;
		gap: var(--space-6);
	}
	.check-list,
	.activity {
		list-style: none;
		padding: var(--space-3) var(--space-5) var(--space-5);
		display: grid;
		gap: var(--space-3);
		font-size: 0.875rem;
	}
	.check-list li {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
		color: var(--warning-600);
	}
	.check-list li.ok {
		color: var(--success-600);
	}
	.check-list li span,
	.check-list li a {
		color: var(--concrete-900);
	}
	.check-list li.ok span {
		color: var(--concrete-500);
		text-decoration: line-through;
	}
	.check-list .caption {
		margin-left: auto;
	}
	.activity li {
		display: grid;
		gap: 2px;
		padding-bottom: var(--space-3);
		border-bottom: 1px dashed var(--concrete-200);
	}
	.activity li:last-child {
		border-bottom: 0;
	}
</style>
