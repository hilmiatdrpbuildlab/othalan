<script lang="ts">
	import InboxDetail from '$lib/components/admin/InboxDetail.svelte';
	import { REPORT_STATUS } from '$lib/site-config';
	let { data } = $props();
	const r = $derived(data.r);
</script>

<InboxDetail
	back={{ href: '/admin/denuncias', label: 'Canal de denuncias' }}
	title={`Denuncia ${r.folio}`}
	createdAt={r.createdAt}
	status={r.status}
	statuses={REPORT_STATUS}
	canWrite={data.canWrite}
	email={r.anonymous ? null : r.email}
	notes={r.notes}
	withNotes
	eraseLabel="Eliminar denuncia"
	rows={[
		['Folio', r.folio],
		['Tipo', r.category],
		['Hechos', r.description],
		['Cuándo', r.occurredAt],
		['Dónde', r.location],
		['Involucrados', r.peopleInvolved],
		['Identificación', r.anonymous ? 'Anónima' : 'Identificada'],
		['Nombre', r.name],
		['Correo', r.email],
		['Teléfono', r.phone]
	]}
/>
