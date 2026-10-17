<script lang="ts">
	import InboxList from '$lib/components/admin/InboxList.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { REPORT_STATUS } from '$lib/site-config';
	let { data } = $props();
</script>

<svelte:head><title>Denuncias | Panel Othalan</title></svelte:head>
<Toast />
<div class="adm-page-head">
	<div>
		<p class="eyebrow">Bandeja confidencial</p>
		<h1>Canal de denuncias</h1>
		<p>Solo administradores. Ley 21.643 (Ley Karin): la investigación debe iniciarse y concluirse dentro de los plazos legales; consulta el procedimiento interno.</p>
	</div>
</div>
<p class="alert alert--warning conf"><Icon name="lock" size={18} /><span>Información confidencial. No compartas el contenido fuera del equipo investigador.</span></p>
<InboxList base="/admin/denuncias" rows={data.rows} statuses={REPORT_STATUS} current={data.status} q={data.q} newStatus="recibida" columns={['Folio', 'Tipo', 'Identificación']} emptyIcon="lock" />

<style>
	.conf {
		margin-bottom: var(--space-4);
	}
</style>
