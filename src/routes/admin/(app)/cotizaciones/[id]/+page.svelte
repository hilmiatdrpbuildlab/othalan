<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import { RFQ_STATUS } from '$lib/site-config';
	import { formatBytes, formatDate, formatDateTime } from '$lib/utils/format';
	import { phoneDigits } from '$lib/utils/phone';

	let { data, form } = $props();
	const r = $derived(data.rfq);
	let note = $state('');
	const fileHref = (key: string, name: string) => `/admin/archivos/${key.replace(/^private\//, '')}?nombre=${encodeURIComponent(name)}`;
	const tender = $derived(r.tenderType && r.tenderType !== 'no' ? `${r.tenderType === 'publica' ? 'Pública' : 'Privada'}${r.tenderNumber ? ` · ${r.tenderNumber}` : ''}` : 'No');
	const steps = Object.keys(RFQ_STATUS).filter((s) => s !== 'no_adjudicada');
</script>

<svelte:head><title>{r.ticketCode} | Cotizaciones | Panel Othalan</title></svelte:head>
<Toast />

<div class="adm-page-head">
	<div>
		<a href="/admin/cotizaciones" class="link-arrow"><Icon name="arrow-left" size={14} /> Cotizaciones</a>
		<h1 class="mono tk">{r.ticketCode}</h1>
		<p>Recibida el {formatDateTime(r.createdAt)} · {r.company || r.contactName}</p>
	</div>
	<div class="adm-actions">
		<a class="btn btn--secondary btn--sm" href="mailto:{r.email}?subject={encodeURIComponent(`Cotización ${r.ticketCode} — Othalan`)}"><Icon name="mail" size={14} /> Responder</a>
		{#if r.phone}
			<a class="btn btn--whatsapp btn--sm" href="https://wa.me/{phoneDigits(r.phone)}?text={encodeURIComponent(`Hola ${r.contactName.split(' ')[0]}, le escribimos de Othalan por su solicitud ${r.ticketCode}.`)}" target="_blank" rel="noopener"><Icon name="brand-whatsapp" size={14} /> WhatsApp</a>
		{/if}
	</div>
</div>

<ol class="track" aria-label="Etapa">
	{#each steps as s, i (s)}
		{@const cur = steps.indexOf(r.status)}
		<li class:done={cur > i || r.status === 'adjudicada'} class:now={r.status === s}>{RFQ_STATUS[s]}</li>
	{/each}
	{#if r.status === 'no_adjudicada'}<li class="lost">No adjudicada</li>{/if}
</ol>

<div class="layout">
	<div class="main">
		<section class="panel">
			<div class="panel__head"><h2>Contacto</h2></div>
			<dl class="kv panel__body">
				<dt>Nombre</dt><dd>{r.contactName}</dd>
				{#if r.company}<dt>Empresa</dt><dd>{r.company}</dd>{/if}
				{#if r.rut}<dt>RUT</dt><dd class="mono">{r.rut}</dd>{/if}
				{#if r.position}<dt>Cargo</dt><dd>{r.position}</dd>{/if}
				<dt>Correo</dt><dd><a href="mailto:{r.email}">{r.email}</a></dd>
				{#if r.phone}<dt>Teléfono</dt><dd><a href="tel:+{phoneDigits(r.phone)}">{r.phone}</a></dd>{/if}
				{#if r.contactPreference}<dt>Prefiere</dt><dd>{r.contactPreference}</dd>{/if}
			</dl>
		</section>
		<section class="panel">
			<div class="panel__head"><h2>Proyecto</h2></div>
			<dl class="kv panel__body">
				<dt>Servicio</dt><dd>{r.serviceLabel ?? '—'}</dd>
				{#if r.sectors.length}<dt>Sector</dt><dd>{r.sectors.join(', ')}</dd>{/if}
				<dt>Ubicación</dt><dd>{[r.comuna, r.region].filter(Boolean).join(', ') || '—'}</dd>
				{#if r.startDate}<dt>Inicio estimado</dt><dd>{formatDate(r.startDate)}</dd>{/if}
				<dt>Licitación</dt><dd>{tender}</dd>
				{#if r.areaM2}<dt>Superficie</dt><dd class="mono">{r.areaM2} m²</dd>{/if}
				{#if r.steelTons}<dt>Acero</dt><dd class="mono">{r.steelTons} t</dd>{/if}
				{#if r.budgetRange}<dt>Presupuesto</dt><dd>{r.budgetRange}</dd>{/if}
				<dt>Descripción</dt><dd>{r.description}</dd>
			</dl>
		</section>
		<section class="panel">
			<div class="panel__head"><h2>Archivos adjuntos ({data.files.length})</h2></div>
			<div class="panel__body">
				{#if data.files.length}
					<ul class="files">
						{#each data.files as f (f.id)}
							<li>
								<Icon name="paperclip" size={16} />
								<a href={fileHref(f.storageKey, f.filename)}>{f.filename}</a>
								<span class="mono caption">{formatBytes(f.bytes)}</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="caption">Sin archivos adjuntos.</p>
				{/if}
			</div>
		</section>
		{#if r.sourceUrl || r.utm}
			<section class="panel">
				<div class="panel__head"><h2>Origen</h2></div>
				<dl class="kv panel__body">
					{#if r.sourceUrl}<dt>Página</dt><dd class="mono caption">{r.sourceUrl}</dd>{/if}
					{#if r.utm}<dt>Campaña</dt><dd class="mono caption">{Object.entries(r.utm).map(([k, v]) => `${k}=${v}`).join(' · ')}</dd>{/if}
					<dt>Consentimiento</dt><dd class="caption">{formatDateTime(r.consentAt)}</dd>
				</dl>
			</section>
		{/if}
	</div>

	<aside class="side">
		<form method="POST" action="?/update" class="panel" use:enhance>
			<fieldset disabled={!data.canWrite}>
				<div class="panel__head"><h2>Gestión</h2></div>
				<div class="panel__body form-grid">
					<div class="field">
						<label class="field__label" for="status">Estado</label>
						<select class="select" id="status" name="status" value={r.status}>
							{#each Object.entries(RFQ_STATUS) as [k, l] (k)}<option value={k}>{l}</option>{/each}
						</select>
					</div>
					<div class="field">
						<label class="field__label" for="assignedTo">Responsable</label>
						<select class="select" id="assignedTo" name="assignedTo" value={r.assignedTo ?? ''}>
							<option value="">Sin asignar</option>
							{#each data.team as u (u.id)}<option value={u.id}>{u.name}</option>{/each}
						</select>
					</div>
					<button class="btn btn--primary btn--block">Guardar</button>
				</div>
			</fieldset>
		</form>

		<section class="panel">
			<div class="panel__head"><h2>Notas internas</h2></div>
			<div class="panel__body">
				{#if data.canWrite}
					<form
						method="POST"
						action="?/note"
						use:enhance={() =>
							async ({ update }) => {
								await update();
								note = '';
							}}
						class="note-form"
					>
						<textarea class="textarea" name="body" rows="3" placeholder="Ej: Visita técnica agendada para el martes 10:00" bind:value={note} aria-label="Nueva nota"></textarea>
						<button class="btn btn--outline btn--sm" disabled={!note.trim()}>Agregar nota</button>
						{#if form?.error}<p class="field__error">{form.error}</p>{/if}
					</form>
				{/if}
				<ul class="notes">
					{#each data.notes as n (n.id)}
						<li>
							<p>{n.body}</p>
							<span class="caption">{n.authorName ?? '—'} · {formatDateTime(n.createdAt)}</span>
						</li>
					{:else}
						<li class="caption">Sin notas.</li>
					{/each}
				</ul>
			</div>
		</section>

		{#if data.canWrite}
			<form
				method="POST"
				action="?/erase"
				class="panel erase"
				use:enhance={({ cancel }) => {
					if (!confirm('Se eliminarán definitivamente la solicitud, sus notas y archivos. ¿Continuar?')) cancel();
				}}
			>
				<div class="panel__body">
					<p class="caption">Si el titular solicita la eliminación de sus datos (Ley 21.719):</p>
					<button class="btn btn--ghost btn--sm danger"><Icon name="trash" size={14} /> Eliminar datos de esta solicitud</button>
				</div>
			</form>
		{/if}
	</aside>
</div>

<style>
	.tk {
		text-transform: none;
	}
	.track {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-bottom: var(--space-6);
	}
	.track li {
		flex: 1;
		min-width: 110px;
		padding: 8px 12px;
		background: var(--concrete-100);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--concrete-600);
		clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%);
	}
	.track li.done {
		background: var(--carbon-900);
		color: var(--white);
	}
	.track li.now {
		background: var(--yellow-500);
		color: var(--carbon-950);
		font-weight: 700;
	}
	.track li.lost {
		background: var(--error-600);
		color: var(--white);
	}
	.layout {
		display: grid;
		gap: var(--space-6);
		align-items: start;
	}
	@media (min-width: 1100px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 340px;
		}
	}
	.main,
	.side {
		display: grid;
		gap: var(--space-5);
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
	}
	.files {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-2);
	}
	.files li {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}
	.note-form {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.notes {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-3);
	}
	.notes li {
		padding-left: var(--space-3);
		border-left: 3px solid var(--yellow-500);
	}
	.notes p {
		white-space: pre-line;
		font-size: 0.875rem;
	}
	.danger {
		color: var(--error-600);
	}
</style>
