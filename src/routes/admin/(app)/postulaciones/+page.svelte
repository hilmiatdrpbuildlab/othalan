<script lang="ts">
	import InboxList from '$lib/components/admin/InboxList.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import { APPLICATION_STATUS } from '$lib/site-config';
	let { data } = $props();
</script>

<svelte:head><title>Postulaciones | Panel Othalan</title></svelte:head>
<Toast />
<div class="adm-page-head">
	<div>
		<p class="eyebrow">Bandeja</p>
		<h1>Postulaciones</h1>
		<p>Los CV se conservan por un año y luego se eliminan automáticamente.</p>
	</div>
	<a href="/admin/c/empleos" class="btn btn--outline btn--sm">Ofertas de empleo</a>
</div>
<InboxList base="/admin/postulaciones" rows={data.rows} statuses={APPLICATION_STATUS} current={data.status} q={data.q} newStatus="recibida" columns={['Postulante', 'Cargo', 'Región']} emptyIcon="id-badge-2" />
