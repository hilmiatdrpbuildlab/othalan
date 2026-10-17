<script lang="ts">
	import { splitHighlight } from '$lib/utils/highlight';
	let { text }: { text: string | null | undefined } = $props();
</script>

{#each splitHighlight(text) as part, i (i)}{#if part.mark}<mark class="hl">{part.text}</mark>{:else}{part.text}{/if}{/each}
