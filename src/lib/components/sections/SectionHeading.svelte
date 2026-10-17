<script lang="ts">
	import type { Snippet } from 'svelte';
	import Highlight from '$lib/components/ui/Highlight.svelte';

	type Props = {
		eyebrow?: string | null;
		index?: string;
		title: string | null | undefined;
		lead?: string | null;
		level?: 1 | 2 | 3;
		align?: 'start' | 'center';
		id?: string;
		actions?: Snippet;
	};
	let { eyebrow, index, title, lead, level = 2, align = 'start', id, actions }: Props = $props();
</script>

<header class="sh" data-align={align}>
	<div class="sh__text">
		{#if eyebrow}
			<p class="eyebrow">{#if index}<span class="eyebrow__index">{index} /</span>{/if}{eyebrow}</p>
		{/if}
		<svelte:element this={`h${level}`} {id} class={level === 1 ? 'h1' : 'h2'}><Highlight text={title} /></svelte:element>
		{#if lead}<p class="lead">{lead}</p>{/if}
	</div>
	{#if actions}<div class="sh__actions">{@render actions()}</div>{/if}
</header>

<style>
	.sh {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-6);
		margin-bottom: var(--space-10);
	}
	.sh__text {
		display: grid;
		gap: var(--space-4);
		max-width: 52rem;
	}
	.sh__text .eyebrow {
		margin-bottom: calc(var(--space-2) * -1);
	}
	.sh[data-align='center'] {
		justify-content: center;
		text-align: center;
	}
	.sh[data-align='center'] .sh__text {
		justify-items: center;
	}
</style>
