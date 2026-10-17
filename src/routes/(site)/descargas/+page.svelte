<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import { formatBytes } from '$lib/utils/format';
	import { mediaUrl } from '$lib/utils/image';

	let { data } = $props();
	type Row = { id: string; title: string; description: string | null; category: string; url: string; bytes: number; ext: string };
	const rows = $derived<Row[]>([
		...data.downloads.map((d) => ({
			id: d.id,
			title: d.title,
			description: d.description,
			category: d.category || 'Documentos',
			url: mediaUrl(d.file!.storageKey),
			bytes: d.file!.bytes,
			ext: d.file!.filename.split('.').pop()?.toUpperCase() ?? 'PDF'
		})),
		...data.certFiles.map((c) => ({
			id: c.id,
			title: c.name,
			description: c.issuer,
			category: 'Certificados',
			url: mediaUrl(c.file!.storageKey),
			bytes: c.file!.bytes,
			ext: 'PDF'
		}))
	]);
	const groups = $derived([...new Set(rows.map((r) => r.category))].map((cat) => ({ cat, items: rows.filter((r) => r.category === cat) })));
</script>

<Seo title="Descargas" description="Brochure corporativo, certificados y documentación de Othalan para registros de proveedores y licitaciones." />

<PageHero eyebrow="Descargas" title="Documentación *corporativa*" lead="Brochure, certificados y antecedentes para registros de proveedores y licitaciones." crumbs={[{ label: 'Descargas' }]} />

<section class="section">
	<div class="container container--narrow">
		{#each groups as g (g.cat)}
			<h2 class="h4 group">{g.cat}</h2>
			<ul class="files">
				{#each g.items as f (f.id)}
					<li>
						<span class="files__icon"><Icon name="file-type-pdf" size={28} /></span>
						<div>
							<p class="files__title">{f.title}</p>
							{#if f.description}<p class="body-sm muted">{f.description}</p>{/if}
							<p class="mono caption">{f.ext} · {formatBytes(f.bytes)}</p>
						</div>
						<a href={f.url} class="btn btn--outline btn--sm" target="_blank" rel="noopener" download>
							<Icon name="download" size={16} /> Descargar <span class="sr-only">{f.title}</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="muted">Aún no hay documentos disponibles. Si necesitas antecedentes de la empresa, <a href="/contacto">escríbenos</a>.</p>
		{/each}
	</div>
</section>

<style>
	.group {
		margin: var(--space-10) 0 var(--space-4);
	}
	.group:first-child {
		margin-top: 0;
	}
	.files {
		list-style: none;
		padding: 0;
		border-top: 1px solid var(--color-border);
	}
	.files li {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: var(--space-4);
		align-items: center;
		padding: var(--space-4) 0;
		border-bottom: 1px solid var(--color-border);
	}
	.files__icon {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
		background: var(--copper-100);
		color: var(--copper-700);
	}
	.files__title {
		font-weight: 600;
	}
	@media (max-width: 560px) {
		.files li {
			grid-template-columns: auto 1fr;
		}
		.files .btn {
			grid-column: 2;
			justify-self: start;
		}
	}
</style>
