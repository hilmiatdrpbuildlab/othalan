<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import MediaField from '$lib/components/admin/MediaField.svelte';
	import { HOME_SECTION_LABELS, type HomeSectionKey } from '$lib/site-config';

	let { data } = $props();

	type Sec = { key: HomeSectionKey; enabled: boolean; data: Record<string, unknown> };
	let sections = $state<Sec[]>(structuredClone(data.sections) as unknown as Sec[]);
	let media = $state({ ...data.media });
	let saving = $state(false);
	let openKey = $state<string>('hero');
	let loaded = data.sections;
	$effect.pre(() => {
		if (data.sections === loaded) return;
		loaded = data.sections;
		sections = structuredClone(data.sections) as unknown as Sec[];
		media = { ...data.media };
	});

	const LABELS: Record<string, string> = {
		eyebrow: 'Antetítulo',
		title: 'Título',
		subtitle: 'Subtítulo',
		lead: 'Bajada',
		text: 'Texto',
		label: 'Texto del botón',
		href: 'Enlace',
		imageId: 'Imagen',
		primary: 'Botón principal',
		secondary: 'Botón secundario',
		features: 'Tarjetas sobre la portada',
		points: 'Razones (01–04)',
		steps: 'Pasos del proceso'
	};
	const HELP: Record<string, string> = {
		title: 'Encierra una palabra entre *asteriscos* para destacarla en color.',
		imageId: 'Usa una foto real de obra, horizontal, de al menos 1920 px.',
		features: 'Deja el título vacío para ocultar una tarjeta.',
		points: 'Deja el título vacío para ocultar una razón.',
		steps: 'Deja el título vacío para ocultar un paso.'
	};
	const SOURCE: Partial<Record<HomeSectionKey, { href: string; label: string }>> = {
		clients: { href: '/admin/c/clientes', label: 'Gestionar clientes' },
		services: { href: '/admin/c/servicios', label: 'Gestionar servicios' },
		projects: { href: '/admin/c/proyectos', label: 'Proyectos (marca "Destacar en Inicio")' },
		team: { href: '/admin/c/equipo', label: 'Gestionar equipo' },
		safety: { href: '/admin/c/certificaciones', label: 'Certificaciones e indicadores' },
		testimonials: { href: '/admin/c/testimonios', label: 'Gestionar testimonios' },
		why: { href: '/admin/c/estadisticas', label: 'Estadísticas (la primera se muestra sobre la foto)' }
	};
	const long = (k: string) => ['subtitle', 'lead', 'text'].includes(k);

	function move(i: number, d: number) {
		const j = i + d;
		if (j < 1 || j >= sections.length) return;
		[sections[i], sections[j]] = [sections[j], sections[i]];
	}
</script>

<svelte:head><title>Página de inicio | Panel Othalan</title></svelte:head>
<Toast />

{#snippet fieldsFor(obj: Record<string, unknown>, path: string)}
	{#each Object.entries(obj) as [k, v] (k)}
		{@const name = `${path}.${k}`}
		{#if k === 'imageId'}
			<div class="field full">
				<span class="field__label">{LABELS[k]}</span>
				<MediaField {name} id="f-{name}" bind:value={obj[k] as string} bind:mediaMap={media} />
				{#if HELP[k]}<p class="field__help">{HELP[k]}</p>{/if}
			</div>
		{:else if Array.isArray(v)}
			<fieldset class="group full">
				<legend class="field__label">{LABELS[k] ?? k}</legend>
				{#if HELP[k]}<p class="field__help">{HELP[k]}</p>{/if}
				<div class="items">
					{#each v as item, i (i)}
						<div class="item">
							<span class="mono caption">{String(i + 1).padStart(2, '0')}</span>
							{@render fieldsFor(item as Record<string, unknown>, `${name}.${i}`)}
						</div>
					{/each}
				</div>
			</fieldset>
		{:else if v && typeof v === 'object'}
			<fieldset class="group">
				<legend class="field__label">{LABELS[k] ?? k}</legend>
				<div class="pair">{@render fieldsFor(v as Record<string, unknown>, name)}</div>
			</fieldset>
		{:else}
			<div class="field" class:full={long(k) || k === 'title'}>
				<label class="field__label" for="f-{name}">{LABELS[k] ?? k}</label>
				{#if long(k)}
					<textarea class="textarea" id="f-{name}" {name} rows="2" bind:value={obj[k] as string}></textarea>
				{:else}
					<input class="input" id="f-{name}" {name} bind:value={obj[k] as string} />
				{/if}
				{#if HELP[k] && path.split('.').length === 1}<p class="field__help">{HELP[k]}</p>{/if}
			</div>
		{/if}
	{/each}
{/snippet}

<form
	method="POST"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
		};
	}}
>
	<div class="adm-page-head">
		<div>
			<p class="eyebrow">Sitio</p>
			<h1>Página de inicio</h1>
			<p>Activa, ordena y edita las secciones de la portada. Las secciones sin contenido (por ejemplo, sin testimonios publicados) se ocultan solas.</p>
		</div>
		<div class="adm-actions">
			<a href="/" target="_blank" class="btn btn--outline btn--sm"><Icon name="external-link" size={14} /> Ver inicio</a>
			{#if data.canWrite}
				<button class="btn btn--primary" disabled={saving}>{#if saving}<span class="spinner"></span>{:else}<Icon name="device-floppy" size={16} />{/if} Guardar cambios</button>
			{/if}
		</div>
	</div>

	<input type="hidden" name="__order" value={sections.map((s) => s.key).join(',')} />

	<fieldset disabled={!data.canWrite} class="secs">
		{#each sections as s, i (s.key)}
			<section class="panel sec" class:off={!s.enabled}>
				<div class="sec__head">
					<span class="sec__num mono">{String(i + 1).padStart(2, '0')}</span>
					<button type="button" class="sec__title" onclick={() => (openKey = openKey === s.key ? '' : s.key)} aria-expanded={openKey === s.key}>
						<strong>{HOME_SECTION_LABELS[s.key]}</strong>
						<Icon name="chevron-down" size={16} />
					</button>
					{#if s.key !== 'hero'}
						<label class="switch"><input type="checkbox" name="{s.key}.__enabled" bind:checked={s.enabled} /><span class="caption">{s.enabled ? 'Visible' : 'Oculta'}</span></label>
						<button type="button" class="icon-btn mini" onclick={() => move(i, -1)} disabled={i <= 1} aria-label="Subir sección"><Icon name="arrow-up" size={14} /></button>
						<button type="button" class="icon-btn mini" onclick={() => move(i, 1)} disabled={i === sections.length - 1} aria-label="Bajar sección"><Icon name="arrow-down" size={14} /></button>
					{:else}
						<span class="badge">Siempre visible</span>
					{/if}
				</div>
				<div class="sec__body" hidden={openKey !== s.key}>
					{#if SOURCE[s.key]}
						<p class="alert alert--info src"><Icon name="info-circle" size={16} /><span>El contenido de esta sección viene de <a href={SOURCE[s.key]!.href}>{SOURCE[s.key]!.label}</a>.</span></p>
					{/if}
					<div class="grid">{@render fieldsFor(s.data, s.key)}</div>
				</div>
			</section>
		{/each}
	</fieldset>
</form>

<style>
	.secs {
		border: 0;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-3);
	}
	.sec.off {
		opacity: 0.7;
	}
	.sec__head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
	}
	.sec__num {
		color: var(--copper-600);
	}
	.sec__title {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		border: 0;
		background: none;
		padding: 6px 0;
		text-align: left;
		font-size: 1rem;
	}
	.sec__title[aria-expanded='true'] :global(svg) {
		transform: rotate(180deg);
	}
	.sec__body {
		padding: 0 var(--space-5) var(--space-5);
		border-top: 1px solid var(--concrete-200);
	}
	.src {
		margin-top: var(--space-4);
	}
	.grid {
		display: grid;
		gap: var(--space-4);
		padding-top: var(--space-4);
	}
	@media (min-width: 800px) {
		.grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	.grid :global(.full) {
		grid-column: 1 / -1;
	}
	.group {
		border: 1px solid var(--concrete-200);
		border-radius: var(--radius-md);
		padding: var(--space-3) var(--space-4) var(--space-4);
		display: grid;
		gap: var(--space-3);
	}
	.group legend {
		padding: 0 6px;
	}
	.pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}
	.items {
		display: grid;
		gap: var(--space-3);
	}
	@media (min-width: 900px) {
		.items {
			grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		}
	}
	.item {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--concrete-25);
		border-radius: var(--radius-md);
	}
</style>
