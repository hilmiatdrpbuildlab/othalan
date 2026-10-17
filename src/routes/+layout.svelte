<script lang="ts">
	import '@fontsource/barlow-condensed/latin-600.css';
	import '@fontsource/barlow-condensed/latin-700.css';
	import '@fontsource/barlow-condensed/latin-800.css';
	import '@fontsource/barlow-condensed/latin-ext-700.css';
	import '@fontsource-variable/inter';
	import '@fontsource/jetbrains-mono/latin-500.css';
	import '$lib/styles/tokens.css';
	import '$lib/styles/base.css';
	import '$lib/styles/components.css';

	import { onMount } from 'svelte';

	let { children } = $props();
	// Marker used by e2e tests (and CSS hooks) to know the app is interactive.
	onMount(() => (document.documentElement.dataset.hydrated = ''));
</script>

{@render children()}
