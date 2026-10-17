<script lang="ts">
	import { tick } from 'svelte';

	let { errors, labels = {} }: { errors: Record<string, string> | null | undefined; labels?: Record<string, string> } = $props();
	let el: HTMLElement | undefined = $state();
	const list = $derived(Object.entries(errors ?? {}).filter(([k]) => k !== '_form'));

	$effect(() => {
		if (errors && Object.keys(errors).length) tick().then(() => el?.focus());
	});
</script>

{#if errors && Object.keys(errors).length}
	<div class="error-summary" role="alert" tabindex="-1" bind:this={el}>
		<h2>{errors._form ?? 'Revisa los siguientes campos:'}</h2>
		{#if list.length}
			<ul>
				{#each list as [field, msg] (field)}
					<li><a href="#f-{field}">{labels[field] ? `${labels[field]}: ` : ''}{msg}</a></li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style>
	.error-summary {
		margin-bottom: var(--space-6);
	}
	ul {
		padding-left: 1.2em;
		font-size: var(--text-body-sm);
	}
	.error-summary:focus {
		outline: 2px solid var(--error-600);
		outline-offset: 2px;
	}
</style>
