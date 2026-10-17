<script lang="ts">
	import Icon, { ICON_NAMES } from '$lib/components/ui/Icon.svelte';

	let { name, id, value = $bindable('') }: { name: string; id: string; value: string } = $props();
	let open = $state(false);
	let filter = $state('');
	const list = $derived(ICON_NAMES.filter((n) => !n.startsWith('brand-') && n.includes(filter.toLowerCase())));
</script>

<input type="hidden" {name} {value} />
<div class="if">
	<button {id} type="button" class="if__current" onclick={() => (open = !open)} aria-expanded={open}>
		<span class="if__preview"><Icon name={value || 'tools'} size={24} /></span>
		<span class="mono">{value || 'Elegir ícono'}</span>
	</button>
	{#if open}
		<div class="if__panel">
			<input class="input" placeholder="Filtrar íconos…" bind:value={filter} aria-label="Filtrar íconos" />
			<div class="if__grid">
				{#each list as n (n)}
					<button
						type="button"
						class:sel={n === value}
						title={n}
						aria-label={n}
						onclick={() => {
							value = n;
							open = false;
						}}><Icon name={n} size={22} /></button
					>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.if__current {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 40px;
		padding: 4px 12px 4px 4px;
		border: 1px solid var(--concrete-300);
		border-radius: var(--radius-md);
		background: var(--white);
	}
	.if__preview {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-sm);
		background: var(--yellow-100);
	}
	.if__panel {
		margin-top: var(--space-2);
		padding: var(--space-3);
		border: 1px solid var(--concrete-200);
		border-radius: var(--radius-md);
		background: var(--white);
		box-shadow: var(--shadow-md);
		display: grid;
		gap: var(--space-3);
	}
	.if__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
		gap: 4px;
		max-height: 240px;
		overflow-y: auto;
	}
	.if__grid button {
		display: grid;
		place-items: center;
		height: 40px;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		background: none;
	}
	.if__grid button:hover {
		background: var(--concrete-50);
	}
	.if__grid button.sel {
		background: var(--yellow-500);
	}
</style>
