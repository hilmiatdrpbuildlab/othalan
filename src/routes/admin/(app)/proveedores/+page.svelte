<script lang="ts">
	import InboxList from '$lib/components/admin/InboxList.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import { INBOX_STATUS } from '$lib/site-config';
	let { data } = $props();
</script>

<svelte:head><title>Proveedores | Panel Othalan</title></svelte:head>
<Toast />
<div class="adm-page-head"><div><p class="eyebrow">Bandeja</p><h1>Registro de proveedores</h1></div></div>
<InboxList base="/admin/proveedores" rows={data.rows} statuses={INBOX_STATUS} current={data.status} q={data.q} newStatus="nuevo" columns={['Empresa', 'Rubro', 'Región']} emptyIcon="truck-delivery" />
