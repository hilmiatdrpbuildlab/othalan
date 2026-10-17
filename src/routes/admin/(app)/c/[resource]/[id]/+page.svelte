<script lang="ts">
	import { enhance } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import Icon from '$lib/components/ui/Icon.svelte';
	import ResourceField from '$lib/components/admin/ResourceField.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import ErrorSummary from '$lib/components/form/ErrorSummary.svelte';
	import { formatDateTime } from '$lib/utils/format';

	let { data, form } = $props();
	const m = $derived(data.meta);

	// Local editable copy of the record; re-initialised whenever the record changes (navigation / save).
	// Initialised synchronously (SSR) and re-initialised only when the loaded record changes.
	const init = () => ({ ...structuredClone(data.values), __existing: !data.isNew }) as Record<string, unknown>;
	let values = $state(init());
	let media = $state({ ...data.media });
	let initial = $state(JSON.stringify(init()));
	let loaded = data.values;
	let saving = $state(false);
	$effect.pre(() => {
		if (data.values === loaded) return;
		loaded = data.values;
		const v = init();
		values = v;
		media = { ...data.media };
		initial = JSON.stringify(v);
	});
	const dirty = $derived(JSON.stringify(values) !== initial && !saving);

	beforeNavigate(({ cancel, type }) => {
		if (dirty && type !== 'form' && !confirm('Tienes cambios sin guardar. ¿Salir de todas formas?')) cancel();
	});

	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
	const sections = $derived.by(() => {
		const out: { name: string; fields: typeof m.fields }[] = [];
		for (const f of m.fields) {
			if (f.type === 'status' || f.section === 'Publicación') continue;
			const name = f.section ?? 'General';
			let s = out.find((x) => x.name === name);
			if (!s) out.push((s = { name, fields: [] }));
			s.fields.push(f);
		}
		return out;
	});
	const pubFields = $derived(m.fields.filter((f) => f.section === 'Publicación' || f.type === 'status'));
	const labels = $derived(Object.fromEntries(m.fields.map((f) => [f.name, f.label])));
	const title = $derived(String(values[m.titleField] ?? '') || `Nuevo ${m.singular}`);
</script>

<svelte:head><title>{title} | {m.label} | Panel Othalan</title></svelte:head>
<Toast />

<div class="adm-page-head">
	<div>
		<a href="/admin/c/{m.key}" class="link-arrow back"><Icon name="arrow-left" size={14} /> {m.label}</a>
		<h1>{title}</h1>
		{#if data.updatedAt}<p class="caption">Última modificación: {formatDateTime(data.updatedAt as string)}</p>{/if}
	</div>
	<div class="adm-actions">
		{#if data.publicUrl}<a class="btn btn--outline btn--sm" href={data.publicUrl} target="_blank" rel="noopener"><Icon name="external-link" size={14} /> Ver en el sitio</a>{/if}
	</div>
</div>

{#if !m.canWrite}
	<div class="alert alert--info" style="margin-bottom:16px"><Icon name="lock" size={18} /><span>Tienes acceso de solo lectura a esta sección.</span></div>
{/if}

<ErrorSummary errors={form?.errors} {labels} />

<form
	method="POST"
	action="?/save"
	id="rf"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
		};
	}}
>
	<div class="layout">
		<div class="main">
			{#each sections as s (s.name)}
				<fieldset class="panel" disabled={!m.canWrite}>
					<legend class="sr-only">{s.name}</legend>
					<div class="panel__head"><h2>{s.name}</h2></div>
					<div class="panel__body grid6">
						{#each s.fields as f (f.name)}
							<ResourceField field={f} bind:values error={errors[f.name]} options={data.relations[f.name]} bind:media />
						{/each}
					</div>
				</fieldset>
			{/each}
		</div>

		<aside class="side">
			<fieldset class="panel" disabled={!m.canWrite}>
				<legend class="sr-only">Publicación</legend>
				<div class="panel__head"><h2>Publicación</h2></div>
				<div class="panel__body grid6 pub">
					{#each pubFields as f (f.name)}
						<ResourceField field={{ ...f, width: 'full' }} bind:values error={errors[f.name]} options={data.relations[f.name]} bind:media />
					{/each}
				</div>
				{#if m.canWrite}
					<div class="save">
						<button class="btn btn--primary btn--block" name="intent" value="save" disabled={saving}>
							{#if saving}<span class="spinner"></span>{:else}<Icon name="device-floppy" size={16} />{/if} Guardar
						</button>
						<div class="save__row">
							<button class="btn btn--outline btn--sm" name="intent" value="save-close" disabled={saving}>Guardar y volver</button>
							<button class="btn btn--ghost btn--sm" name="intent" value="save-new" disabled={saving}>Guardar y crear otro</button>
						</div>
						{#if dirty}<p class="caption dirty"><Icon name="alert-triangle" size={14} /> Cambios sin guardar</p>{/if}
					</div>
				{/if}
			</fieldset>

			{#if !data.isNew && m.canWrite}
				<div class="panel">
					<div class="panel__head"><h2>Acciones</h2></div>
					<div class="panel__body acts">
						<button class="btn btn--ghost btn--sm" form="dup-form"><Icon name="copy" size={14} /> Duplicar</button>
						<button class="btn btn--ghost btn--sm danger-text" form="del-form"><Icon name="trash" size={14} /> Eliminar</button>
					</div>
				</div>
			{/if}

			{#if data.revisions.length}
				<details class="panel revs">
					<summary class="panel__head"><h2>Historial ({data.revisions.length})</h2><Icon name="chevron-down" size={16} /></summary>
					<ul>
						{#each data.revisions as r (r.id)}
							<li>
								<span><span class="mono caption">{formatDateTime(r.createdAt)}</span><br /><small>{r.userName ?? '—'}</small></span>
								{#if m.canWrite}
									<button class="btn btn--ghost btn--sm" form="restore-form" name="revision" value={r.id}>Restaurar</button>
								{/if}
							</li>
						{/each}
					</ul>
					<p class="caption revs__note">Cada versión guarda el estado anterior al cambio.</p>
				</details>
			{/if}
		</aside>
	</div>
</form>

<form id="dup-form" method="POST" action="?/duplicate" hidden></form>
<form
	id="del-form"
	method="POST"
	action="?/delete"
	hidden
	use:enhance={({ cancel }) => {
		if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer desde el panel.')) return cancel();
		initial = JSON.stringify(values);
	}}
></form>
<form
	id="restore-form"
	method="POST"
	action="?/restore"
	hidden
	use:enhance={({ cancel }) => {
		if (!confirm('¿Restaurar esta versión? El estado actual quedará guardado en el historial.')) cancel();
	}}
></form>

<style>
	.back {
		font-size: 0.8125rem;
		margin-bottom: var(--space-2);
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
		.side {
			position: sticky;
			top: 76px;
		}
	}
	.main,
	.side {
		display: grid;
		gap: var(--space-5);
	}
	fieldset.panel {
		min-width: 0;
	}
	.grid6 {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: var(--space-5) var(--space-4);
	}
	.pub {
		gap: var(--space-4);
	}
	.save {
		display: grid;
		gap: var(--space-2);
		padding: 0 var(--space-5) var(--space-5);
	}
	.save__row {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
	.dirty {
		display: flex;
		gap: 4px;
		align-items: center;
		color: var(--warning-600);
	}
	.acts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.danger-text {
		color: var(--error-600);
	}
	.revs summary {
		cursor: pointer;
		list-style: none;
	}
	.revs ul {
		list-style: none;
		padding: var(--space-2) var(--space-5);
		display: grid;
		gap: var(--space-2);
		max-height: 320px;
		overflow-y: auto;
	}
	.revs li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-2);
		padding-bottom: var(--space-2);
		border-bottom: 1px dashed var(--concrete-200);
	}
	.revs__note {
		padding: 0 var(--space-5) var(--space-4);
	}
</style>
