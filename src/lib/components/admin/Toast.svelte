<script lang="ts">
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	const MESSAGES: Record<string, string> = {
		guardado: 'Cambios guardados',
		eliminado: 'Registro eliminado',
		duplicado: 'Copia creada como borrador',
		restaurado: 'Versión restaurada',
		subido: 'Archivo subido',
		creado: 'Creado correctamente'
	};
	let msg = $state('');

	$effect(() => {
		const ok = page.url.searchParams.get('ok');
		if (ok && MESSAGES[ok]) {
			msg = MESSAGES[ok];
			const t = setTimeout(() => (msg = ''), 3500);
			return () => clearTimeout(t);
		}
	});
	onMount(() => {
		if (page.url.searchParams.has('ok')) {
			const u = new URL(page.url);
			u.searchParams.delete('ok');
			setTimeout(() => replaceState(u, page.state), 0);
		}
	});
</script>

{#if msg}
	<div class="toast" role="status"><Icon name="circle-check" size={18} /> {msg}</div>
{/if}
