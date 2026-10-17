<script lang="ts">
	import InboxList from '$lib/components/admin/InboxList.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import { INBOX_STATUS } from '$lib/site-config';
	let { data } = $props();
</script>

<svelte:head><title>Mensajes | Panel Othalan</title></svelte:head>
<Toast />
<div class="adm-page-head"><div><p class="eyebrow">Bandeja</p><h1>Mensajes de contacto</h1></div></div>
<InboxList base="/admin/mensajes" rows={data.rows} statuses={INBOX_STATUS} current={data.status} q={data.q} newStatus="nuevo" columns={['Nombre', 'Empresa / correo', 'Asunto']} emptyIcon="message" />
