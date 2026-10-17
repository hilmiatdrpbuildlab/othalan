<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import { mediaUrl } from '$lib/utils/image';
	import { formatBytes, formatDateTime } from '$lib/utils/format';

	let { data, form } = $props();
	const m = $derived(data.item);
	let fx = $state(data.item.focalX);
	let fy = $state(data.item.focalY);
	let loaded = data.item;
	$effect.pre(() => {
		if (data.item === loaded) return;
		loaded = data.item;
		fx = data.item.focalX;
		fy = data.item.focalY;
	});
	const isImage = $derived(m.mime.startsWith('image/'));
	const url = $derived(mediaUrl(m.storageKey));

	function setFocal(e: MouseEvent) {
		const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
		fx = Math.round(((e.clientX - r.left) / r.width) * 100) / 100;
		fy = Math.round(((e.clientY - r.top) / r.height) * 100) / 100;
	}
	function keyFocal(e: KeyboardEvent) {
		const step = 0.05;
		if (e.key === 'ArrowLeft') fx = Math.max(0, fx - step);
		else if (e.key === 'ArrowRight') fx = Math.min(1, fx + step);
		else if (e.key === 'ArrowUp') fy = Math.max(0, fy - step);
		else if (e.key === 'ArrowDown') fy = Math.min(1, fy + step);
		else return;
		e.preventDefault();
	}
	let copied = $state(false);
</script>

<svelte:head><title>{m.filename} | Medios | Panel Othalan</title></svelte:head>
<Toast />

<div class="adm-page-head">
	<div>
		<a href="/admin/medios" class="link-arrow"><Icon name="arrow-left" size={14} /> Medios</a>
		<h1 class="fn">{m.filename}</h1>
		<p class="mono caption">{m.mime} · {formatBytes(m.bytes)}{#if m.width}&nbsp;· {m.width}×{m.height}px{/if} · subido {formatDateTime(m.createdAt)}</p>
	</div>
	<div class="adm-actions">
		<a class="btn btn--outline btn--sm" href={url} target="_blank" rel="noopener"><Icon name="external-link" size={14} /> Abrir original</a>
		<button
			class="btn btn--ghost btn--sm"
			type="button"
			onclick={async () => {
				await navigator.clipboard.writeText(location.origin + url);
				copied = true;
				setTimeout(() => (copied = false), 1500);
			}}><Icon name="copy" size={14} /> {copied ? 'Copiado' : 'Copiar URL'}</button
		>
	</div>
</div>

{#if form?.error}<div class="alert alert--error" style="margin-bottom:16px"><Icon name="alert-circle" size={18} /><span>{form.error}</span></div>{/if}

<div class="layout">
	<div class="panel">
		<div class="panel__head"><h2>{isImage ? 'Punto focal' : 'Vista previa'}</h2></div>
		<div class="panel__body">
			{#if isImage}
				<p class="caption hint">Haz clic sobre la parte más importante de la foto (por ejemplo, el rostro). Así los recortes automáticos no la cortan. También puedes usar las flechas del teclado.</p>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div class="focal" role="application" aria-label="Seleccionar punto focal" tabindex="0" onclick={setFocal} onkeydown={keyFocal}>
					<img src={url} alt={m.alt} />
					<span class="focal__dot" style:left="{fx * 100}%" style:top="{fy * 100}%"></span>
				</div>
				<p class="caption">Así se verá en distintos formatos:</p>
				<div class="crops">
					{#each [['4/5', 'Equipo 4:5'], ['4/3', 'Tarjeta 4:3'], ['16/9', 'Portada 16:9'], ['1/1', 'Cuadrado']] as [r, label] (r)}
						<figure>
							<img src={url} alt="" style:aspect-ratio={r} style:object-position="{fx * 100}% {fy * 100}%" />
							<figcaption class="caption">{label}</figcaption>
						</figure>
					{/each}
				</div>
			{:else}
				<iframe src={url} title={m.filename} class="pdf"></iframe>
			{/if}
		</div>
	</div>

	<aside class="side">
		<form method="POST" action="?/save" class="panel" use:enhance>
			<fieldset disabled={!data.canWrite}>
				<div class="panel__head"><h2>Información</h2></div>
				<div class="panel__body form-grid">
					<input type="hidden" name="focalX" value={fx} />
					<input type="hidden" name="focalY" value={fy} />
					{#if isImage}
						<div class="field">
							<label class="field__label" for="alt">Texto alternativo <span class="field__req">*</span></label>
							<textarea class="textarea" id="alt" name="alt" rows="3" maxlength="300" placeholder="Describe lo que se ve, ej: Soldador con equipo de protección trabajando en una viga">{m.alt}</textarea>
							<p class="field__help">Obligatorio para publicar. Lo leen los lectores de pantalla y Google.</p>
						</div>
					{:else}
						<input type="hidden" name="alt" value={m.alt} />
					{/if}
					<div class="field">
						<label class="field__label" for="caption">Leyenda</label>
						<input class="input" id="caption" name="caption" value={m.caption ?? ''} maxlength="300" />
					</div>
					<div class="field">
						<label class="field__label" for="credit">Crédito / autor</label>
						<input class="input" id="credit" name="credit" value={m.credit ?? ''} maxlength="120" />
					</div>
					<div class="field">
						<label class="field__label" for="folder">Carpeta</label>
						<input class="input" id="folder" name="folder" value={m.folder} maxlength="40" />
					</div>
					<button class="btn btn--primary btn--block"><Icon name="device-floppy" size={16} /> Guardar</button>
				</div>
			</fieldset>
		</form>

		<div class="panel">
			<div class="panel__head"><h2>Dónde se usa</h2></div>
			<div class="panel__body">
				{#if data.usage.length}
					<ul class="usage">
						{#each data.usage as u, i (i)}<li><span class="caption">{u.group}</span><a href={u.href}>{u.label}</a></li>{/each}
					</ul>
				{:else}
					<p class="caption">No se usa en ningún contenido.</p>
				{/if}
				{#if data.canWrite}
					<form
						method="POST"
						action="?/delete"
						use:enhance={({ cancel }) => {
							if (!confirm('¿Eliminar este archivo definitivamente?')) cancel();
						}}
					>
						<button class="btn btn--ghost btn--sm del" disabled={data.usage.length > 0}><Icon name="trash" size={14} /> Eliminar archivo</button>
					</form>
				{/if}
			</div>
		</div>
	</aside>
</div>

<style>
	.fn {
		overflow-wrap: anywhere;
		text-transform: none;
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
	.side {
		display: grid;
		gap: var(--space-5);
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
	}
	.hint {
		margin-bottom: var(--space-3);
	}
	.focal {
		position: relative;
		display: inline-block;
		max-width: 100%;
		cursor: crosshair;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: repeating-conic-gradient(var(--concrete-100) 0 25%, var(--white) 0 50%) 0 0 / 16px 16px;
	}
	.focal img {
		max-height: 60vh;
		width: auto;
	}
	.focal__dot {
		position: absolute;
		width: 28px;
		height: 28px;
		margin: -14px 0 0 -14px;
		border-radius: 50%;
		border: 3px solid var(--yellow-500);
		box-shadow:
			0 0 0 2px var(--carbon-950),
			0 0 0 9999px rgb(11 13 12 / 0.15);
		pointer-events: none;
	}
	.crops {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-3);
		margin-top: var(--space-2);
		align-items: end;
	}
	.crops img {
		width: 100%;
		object-fit: cover;
		border-radius: var(--radius-sm);
	}
	.pdf {
		width: 100%;
		height: 70vh;
	}
	.usage {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.usage li {
		display: grid;
	}
	.del {
		color: var(--error-600);
		margin-top: var(--space-2);
	}
</style>
