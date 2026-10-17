<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	let { items }: { items: { id: string; question: string; answer: string }[] } = $props();
</script>

<div class="faq">
	{#each items as f (f.id)}
		<details>
			<summary>
				<span class="h4">{f.question}</span>
				<span class="faq__icon" aria-hidden="true"><Icon name="plus" size={20} /></span>
			</summary>
			<p>{f.answer}</p>
		</details>
	{/each}
</div>

<style>
	.faq {
		border-top: 1px solid var(--color-border);
	}
	details {
		border-bottom: 1px solid var(--color-border);
	}
	summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-5) 0;
		cursor: pointer;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary .h4 {
		font-size: var(--text-h5);
	}
	.faq__icon {
		flex: none;
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--yellow-100);
		transition:
			transform var(--duration-base) var(--ease-standard),
			background var(--duration-base);
	}
	details[open] .faq__icon {
		transform: rotate(45deg);
		background: var(--yellow-500);
	}
	details p {
		padding-bottom: var(--space-6);
		max-width: 68ch;
		color: var(--color-text-muted);
		white-space: pre-line;
	}
</style>
