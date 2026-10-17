<script lang="ts">
	import InboxDetail from '$lib/components/admin/InboxDetail.svelte';
	import { INBOX_STATUS } from '$lib/site-config';
	let { data } = $props();
	const m = $derived(data.msg);
</script>

<InboxDetail
	back={{ href: '/admin/mensajes', label: 'Mensajes' }}
	title={m.subject || `Mensaje de ${m.name}`}
	createdAt={m.createdAt}
	status={m.status}
	statuses={INBOX_STATUS}
	canWrite={data.canWrite}
	email={m.email}
	rows={[
		['Nombre', m.name],
		['Empresa', m.company],
		['Correo', m.email],
		['Teléfono', m.phone],
		['Mensaje', m.message]
	]}
/>
