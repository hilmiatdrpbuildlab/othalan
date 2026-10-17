<script lang="ts">
	import '$lib/styles/admin.css';
	let { children } = $props();
</script>

<svelte:head><meta name="robots" content="noindex, nofollow" /></svelte:head>

<div class="adm">{@render children()}</div>
