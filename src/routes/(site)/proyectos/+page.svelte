<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import ProjectCard from '$lib/components/cards/ProjectCard.svelte';
	import CtaBand from '$lib/components/sections/CtaBand.svelte';
	import { page } from '$app/state';

	let { data } = $props();

	// Items appended by "Cargar más" (progressive enhancement over the numbered pagination links).
	let extra = $state<typeof data.items>([]);
	let nextPage = $state(0);
	let loading = $state(false);
	let failed = $state(false);

	$effect(() => {
		// Reset when filter / page changes through navigation.
		data.items;
		extra = [];
		nextPage = data.page + 1;
	});

	const items = $derived([...data.items, ...extra]);
	const hasMore = $derived(nextPage <= data.pages);

	const href = (p: number, cat = data.category) => {
		const q = new URLSearchParams();
		if (cat) q.set('categoria', cat);
		if (p > 1) q.set('pagina', String(p));
		const s = q.toString();
		return `/proyectos${s ? '?' + s : ''}`;
	};

	async function loadMore() {
		loading = true;
		failed = false;
		try {
			const q = new URLSearchParams({ pagina: String(nextPage) });
			if (data.category) q.set('categoria', data.category);
			const res = await fetch(`/api/proyectos?${q}`);
			if (!res.ok) throw new Error(String(res.status));
			const json = (await res.json()) as { items: typeof data.items };
			extra = [...extra, ...json.items];
			nextPage += 1;
		} catch {
			failed = true;
		} finally {
			loading = false;
		}
	}

	const activeName = $derived(data.categories.find((c) => c.slug === data.category)?.name);
</script>

<Seo
	title={activeName ? `Proyectos de ${activeName.toLowerCase()}` : 'Proyectos'}
	description="Portafolio de proyectos de Othalan: construcción, industria, montaje, mantención y obras civiles en Chile."
	noindex={data.page > 1}
/>

<PageHero eyebrow="Proyectos" title="Obras que *hablan* por nosotros" lead="Proyectos reales ejecutados por nuestro equipo, con su ficha técnica." crumbs={[{ label: 'Proyectos' }]} />

<section class="section">
	<div class="container">
		<nav class="filters" aria-label="Filtrar proyectos por categoría">
			<a href={href(1, null)} class="filter" aria-current={!data.category ? 'page' : undefined} data-sveltekit-noscroll>Todos</a>
			{#each data.categories as c (c.id)}
				<a href={href(1, c.slug)} class="filter" aria-current={data.category === c.slug ? 'page' : undefined} data-sveltekit-noscroll>{c.name}</a>
			{/each}
		</nav>

		<p class="caption count" role="status">{data.total} {data.total === 1 ? 'proyecto' : 'proyectos'}</p>

		{#if items.length}
			<ul class="grid">
				{#each items as p (p.id)}
					<li>
						<ProjectCard
							href="/proyectos/{p.slug}"
							title={p.title}
							cover={p.cover}
							category={p.categoryName}
							code={p.code}
							location={[p.comuna, p.region].filter(Boolean).join(', ')}
							year={p.year}
							areaM2={p.areaM2}
							steelTons={p.steelTons}
						/>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="empty">
				<Icon name="barrier-block" size={48} />
				<p class="h4">Aún no hay proyectos en esta categoría</p>
				{#if data.category}<a href="/proyectos" class="btn btn--outline">Ver todos</a>{/if}
			</div>
		{/if}

		{#if data.pages > 1}
			<div class="more">
				{#if hasMore}
					<button class="btn btn--secondary" type="button" onclick={loadMore} disabled={loading} data-loading={loading || undefined}>
						{#if loading}<span class="spinner"></span> Cargando…{:else}Cargar más proyectos{/if}
					</button>
				{/if}
				{#if failed}
					<p class="alert alert--error" role="alert">No pudimos cargar más proyectos. <button type="button" onclick={loadMore}>Reintentar</button></p>
				{/if}
				<nav aria-label="Paginación" class="pager">
					{#each Array.from({ length: data.pages }, (_, i) => i + 1) as p (p)}
						<a href={href(p)} aria-current={p === data.page ? 'page' : undefined} class="mono">{p}</a>
					{/each}
				</nav>
			</div>
		{/if}
	</div>
</section>

<CtaBand title="Tu proyecto puede ser el *próximo*" text="Cuéntanos qué necesitas construir, montar o mantener." />

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
	}
	.filter {
		display: inline-flex;
		align-items: center;
		min-height: 40px;
		padding: 0 16px;
		border: 1px solid var(--concrete-300);
		border-radius: var(--radius-full);
		background: var(--white);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
	}
	.filter[aria-current='page'] {
		background: var(--carbon-900);
		border-color: var(--carbon-900);
		color: var(--white);
	}
	@media (hover: hover) {
		.filter:not([aria-current]):hover {
			border-color: var(--carbon-900);
		}
	}
	.count {
		margin-bottom: var(--space-4);
	}
	.grid {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--grid-gutter);
	}
	@media (min-width: 768px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.empty {
		display: grid;
		justify-items: center;
		gap: var(--space-4);
		padding: var(--space-16) var(--space-4);
		text-align: center;
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text-muted);
	}
	.more {
		display: grid;
		justify-items: center;
		gap: var(--space-6);
		margin-top: var(--space-12);
	}
	.pager {
		display: flex;
		gap: var(--space-2);
	}
	.pager a {
		display: grid;
		place-items: center;
		min-width: 40px;
		height: 40px;
		border-radius: var(--radius-sm);
		text-decoration: none;
		border: 1px solid var(--color-border);
	}
	.pager a[aria-current='page'] {
		background: var(--yellow-500);
		border-color: var(--yellow-500);
		font-weight: 700;
	}
</style>
