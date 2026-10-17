<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import SectionHeading from '$lib/components/sections/SectionHeading.svelte';
	import CtaBand from '$lib/components/sections/CtaBand.svelte';
	import { formatDate, formatInt, formatNumber } from '$lib/utils/format';
	import { mediaUrl } from '$lib/utils/image';

	let { data } = $props();
	const pg = $derived(data.page);
	const sf = $derived(data.safety);
	const kpis = $derived(
		sf
			? [
					['Días sin accidentes', sf.daysWithoutAccidents !== null ? formatInt(sf.daysWithoutAccidents) : null],
					['Horas hombre trabajadas', sf.hhWorked !== null ? formatInt(sf.hhWorked) : null],
					['Accidentes con tiempo perdido', sf.accidents !== null ? formatInt(sf.accidents) : null],
					['Tasa de accidentabilidad', sf.accidentRate !== null ? `${formatNumber(sf.accidentRate)}%` : null],
					['Tasa de frecuencia', sf.frequencyRate !== null ? formatNumber(sf.frequencyRate) : null]
				].filter((k): k is [string, string] => k[1] !== null)
			: []
	);
	const KIND: Record<string, string> = { certificacion: 'Certificaciones', registro: 'Registros de contratista', afiliacion: 'Afiliaciones' };
	const groups = $derived(
		Object.entries(KIND)
			.map(([k, title]) => ({ k, title, items: data.certifications.filter((c) => c.kind === k) }))
			.filter((g) => g.items.length)
	);
	const isExpired = (d: string | null) => !!d && new Date(d + 'T23:59:59') < new Date();
</script>

<Seo title={pg?.seoTitle || 'Seguridad y calidad'} description={pg?.seoDescription || pg?.intro} />

<PageHero eyebrow="Seguridad, salud y medio ambiente" title={pg?.title ?? 'Seguridad y calidad'} lead={pg?.intro} image={pg?.cover} crumbs={[{ label: 'Seguridad y calidad' }]} />

{#if kpis.length}
	<section class="section section--tight kpi-sec" data-theme="dark">
		<div class="container">
			<p class="eyebrow">Indicadores de seguridad · {sf?.period}</p>
			<dl class="kpis">
				{#each kpis as [label, value] (label)}
					<div><dt>{label}</dt><dd class="tnum">{value}</dd></div>
				{/each}
			</dl>
			<p class="caption">Actualizado el {formatDate(sf?.updatedAt)}{#if data.settings.mutualidad}&nbsp;· Empresa adherida a {data.settings.mutualidad}{/if}</p>
			{#if sf?.notes}<p class="muted body-sm">{sf.notes}</p>{/if}
		</div>
	</section>
{/if}

{#if data.bodyHtml}
	<section class="section">
		<div class="container container--narrow prose">{@html data.bodyHtml}</div>
	</section>
{/if}

{#each groups as g (g.k)}
	<section class="section section--alt">
		<div class="container">
			<SectionHeading eyebrow="Respaldo" title={g.title} />
			<ul class="certs">
				{#each g.items as c (c.id)}
					<li class="card cert">
						<div class="cert__head">
							{#if c.logo}<img src={mediaUrl(c.logo.storageKey, { w: 160 })} alt="" />{:else}<span class="cert__icon"><Icon name="certificate" size={28} /></span>{/if}
							<div>
								<h3 class="h5">{c.name}</h3>
								{#if c.issuer}<p class="body-sm muted">{c.issuer}</p>{/if}
							</div>
						</div>
						{#if c.description}<p class="body-sm">{c.description}</p>{/if}
						<dl class="cert__meta mono">
							{#if c.code}<div><dt>N.º</dt><dd>{c.code}</dd></div>{/if}
							{#if c.issuedAt}<div><dt>Emisión</dt><dd>{formatDate(c.issuedAt)}</dd></div>{/if}
							{#if c.expiresAt}<div><dt>Vigencia</dt><dd>{formatDate(c.expiresAt)} {#if isExpired(c.expiresAt)}<span class="badge badge--warning">En renovación</span>{/if}</dd></div>{/if}
						</dl>
						{#if c.file}
							<a href={mediaUrl(c.file.storageKey)} class="link-arrow" target="_blank" rel="noopener"><Icon name="download" size={16} /> Descargar certificado (PDF)</a>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/each}

<CtaBand title="Seguridad y calidad en *tu* proyecto" text="Solicita nuestra documentación de seguridad y calidad junto con tu cotización." />

<style>
	.kpi-sec {
		background: var(--carbon-900);
	}
	.kpi-sec .eyebrow {
		margin-bottom: var(--space-6);
	}
	.kpis {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		margin-bottom: var(--space-4);
	}
	.kpis div {
		padding: var(--space-5);
		background: var(--carbon-800);
		border: 1px solid var(--carbon-700);
		border-top: 4px solid var(--yellow-500);
		border-radius: var(--radius-lg);
	}
	.kpis dt {
		font-size: var(--text-caption);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--concrete-300);
	}
	.kpis dd {
		font-family: var(--font-display);
		font-size: var(--text-h1);
		font-weight: 800;
		color: var(--yellow-500);
	}
	.certs {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--grid-gutter);
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	}
	.cert {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		padding: var(--space-6);
	}
	.cert__head {
		display: flex;
		gap: var(--space-4);
		align-items: center;
	}
	.cert__head img {
		width: 56px;
		height: 56px;
		object-fit: contain;
	}
	.cert__icon {
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		border-radius: var(--radius-md);
		background: var(--yellow-100);
	}
	.cert__meta div {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-1) 0;
		border-bottom: 1px dashed var(--color-border);
	}
	.cert__meta dt {
		color: var(--color-text-muted);
	}
</style>
