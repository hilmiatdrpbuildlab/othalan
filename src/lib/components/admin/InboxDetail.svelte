<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import { formatDateTime } from '$lib/utils/format';

	type Props = {
		back: { href: string; label: string };
		title: string;
		createdAt: Date | string;
		status: string;
		statuses: Record<string, string>;
		canWrite: boolean;
		rows: [string, unknown][];
		email?: string | null;
		notes?: string | null;
		withNotes?: boolean;
		eraseLabel?: string;
		extra?: Snippet;
	};
	let { back, title, createdAt, status, statuses, canWrite, rows, email, notes, withNotes = false, eraseLabel = 'Eliminar datos', extra }: Props = $props();
</script>

<svelte:head><title>{title} | Panel Othalan</title></svelte:head>
<Toast />

<div class="adm-page-head">
	<div>
		<a href={back.href} class="link-arrow"><Icon name="arrow-left" size={14} /> {back.label}</a>
		<h1 class="t">{title}</h1>
		<p>Recibido el {formatDateTime(createdAt)}</p>
	</div>
	{#if email}<a class="btn btn--secondary btn--sm" href="mailto:{email}"><Icon name="mail" size={14} /> Responder por correo</a>{/if}
</div>

<div class="layout">
	<div class="main">
		<section class="panel">
			<dl class="kv panel__body">
				{#each rows.filter(([, v]) => v !== null && v !== undefined && v !== '') as [k, v] (k)}
					<dt>{k}</dt>
					<dd>{v}</dd>
				{/each}
			</dl>
		</section>
		{@render extra?.()}
	</div>
	<aside class="side">
		<form method="POST" action="?/status" class="panel" use:enhance>
			<fieldset disabled={!canWrite}>
				<div class="panel__head"><h2>Gestión</h2></div>
				<div class="panel__body form-grid">
					<div class="field">
						<label class="field__label" for="status">Estado</label>
						<select class="select" id="status" name="status" value={status}>
							{#each Object.entries(statuses) as [k, l] (k)}<option value={k}>{l}</option>{/each}
						</select>
					</div>
					{#if withNotes}
						<div class="field">
							<label class="field__label" for="notes">Notas internas</label>
							<textarea class="textarea" id="notes" name="notes" rows="5">{notes ?? ''}</textarea>
						</div>
					{/if}
					<button class="btn btn--primary btn--block">Guardar</button>
				</div>
			</fieldset>
		</form>
		{#if canWrite}
			<form
				method="POST"
				action="?/erase"
				class="panel"
				use:enhance={({ cancel }) => {
					if (!confirm('Se eliminarán definitivamente estos datos y sus archivos. ¿Continuar?')) cancel();
				}}
			>
				<div class="panel__body">
					<p class="caption">Para solicitudes de eliminación de datos (Ley 21.719):</p>
					<button class="btn btn--ghost btn--sm danger"><Icon name="trash" size={14} /> {eraseLabel}</button>
				</div>
			</form>
		{/if}
	</aside>
</div>

<style>
	.t {
		text-transform: none;
	}
	.layout {
		display: grid;
		gap: var(--space-6);
		align-items: start;
	}
	@media (min-width: 1100px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 320px;
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
	.danger {
		color: var(--error-600);
	}
</style>
