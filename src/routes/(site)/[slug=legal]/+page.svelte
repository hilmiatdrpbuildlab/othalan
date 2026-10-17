<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import { formatDateLong } from '$lib/utils/format';

	let { data } = $props();
	const pg = $derived(data.page);
</script>

<Seo title={pg.seoTitle || pg.title} description={pg.seoDescription || pg.intro} />

<PageHero title={pg.title} lead={pg.intro} crumbs={[{ label: pg.title.replace(/\*/g, '') }]} />

<section class="section">
	<div class="container container--narrow">
		<p class="caption updated">Última actualización: {formatDateLong(pg.updatedAt)}</p>
		<div class="prose">{@html data.bodyHtml}</div>
	</div>
</section>

<style>
	.updated {
		margin-bottom: var(--space-8);
	}
</style>
