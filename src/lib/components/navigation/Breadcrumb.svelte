<script lang="ts">
	type Crumb = { href?: string; label: string };
	let { items }: { items: Crumb[] } = $props();
</script>

<nav aria-label="Ruta de navegación" class="bc">
	<ol>
		<li><a href="/">Inicio</a></li>
		{#each items as c, i (i)}
			<li>
				<span class="mono" aria-hidden="true">/</span>
				{#if c.href && i < items.length - 1}<a href={c.href}>{c.label}</a>{:else}<span aria-current="page">{c.label}</span>{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.bc ol {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--color-text-muted);
	}
	.bc li {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}
	.bc a {
		color: inherit;
		text-underline-offset: 3px;
	}
	.bc [aria-current] {
		color: var(--color-text);
		font-weight: 500;
	}
</style>
