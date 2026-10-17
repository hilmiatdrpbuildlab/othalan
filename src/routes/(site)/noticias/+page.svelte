<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Img from '$lib/components/media/Img.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import { formatDateLong } from '$lib/utils/format';

	let { data } = $props();
</script>

<Seo title="Noticias" description="Novedades, proyectos y actividades de Othalan Ingeniería y Construcción." noindex={data.page > 1} />

<PageHero eyebrow="Noticias" title="Novedades desde *terreno*" crumbs={[{ label: 'Noticias' }]} />

<section class="section">
	<div class="container">
		{#if data.items.length}
			<ul class="posts">
				{#each data.items as p (p.id)}
					<li>
						<a href="/noticias/{p.slug}" class="card post">
							<Img media={p.cover} ratio="3/2" width={768} sizes="(min-width:1024px) 33vw, 100vw" />
							<div class="post__body">
								<p class="caption">{#if p.category}{p.category} · {/if}{formatDateLong(p.publishedAt ?? p.createdAt)}</p>
								<h2 class="h4">{p.title}</h2>
								{#if p.excerpt}<p class="body-sm muted line-clamp-3">{p.excerpt}</p>{/if}
								<span class="link-arrow">Leer más <Icon name="arrow-right" size={16} /></span>
							</div>
						</a>
					</li>
				{/each}
			</ul>
			{#if data.pages > 1}
				<nav class="pager" aria-label="Paginación">
					{#each Array.from({ length: data.pages }, (_, i) => i + 1) as n (n)}
						<a href={n === 1 ? '/noticias' : `/noticias?pagina=${n}`} aria-current={n === data.page ? 'page' : undefined} class="mono">{n}</a>
					{/each}
				</nav>
			{/if}
		{:else}
			<div class="empty">
				<Icon name="news" size={48} />
				<p>Pronto publicaremos novedades.</p>
			</div>
		{/if}
	</div>
</section>

<style>
	.posts {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--grid-gutter);
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	}
	.post {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
		text-decoration: none;
		transition: box-shadow var(--duration-base);
	}
	@media (hover: hover) {
		.post:hover {
			box-shadow: var(--shadow-md);
		}
	}
	.post__body {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-5);
	}
	.pager {
		display: flex;
		gap: var(--space-2);
		justify-content: center;
		margin-top: var(--space-10);
	}
	.pager a {
		display: grid;
		place-items: center;
		min-width: 40px;
		height: 40px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		text-decoration: none;
	}
	.pager a[aria-current] {
		background: var(--yellow-500);
		border-color: var(--yellow-500);
	}
	.empty {
		display: grid;
		justify-items: center;
		gap: var(--space-4);
		padding: var(--space-16);
		color: var(--color-text-muted);
	}
</style>
