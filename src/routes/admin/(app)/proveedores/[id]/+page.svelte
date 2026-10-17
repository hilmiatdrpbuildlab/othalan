<script lang="ts">
	import InboxDetail from '$lib/components/admin/InboxDetail.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { INBOX_STATUS } from '$lib/site-config';
	let { data } = $props();
	const s = $derived(data.s);
</script>

<InboxDetail
	back={{ href: '/admin/proveedores', label: 'Proveedores' }}
	title={s.companyName}
	createdAt={s.createdAt}
	status={s.status}
	statuses={INBOX_STATUS}
	canWrite={data.canWrite}
	email={s.email}
	rows={[
		['Razón social', s.companyName],
		['RUT', s.rut],
		['Rubro', s.category],
		['Contacto', s.contactName],
		['Correo', s.email],
		['Teléfono', s.phone],
		['Región', s.region],
		['Sitio web', s.website],
		['Comentarios', s.message]
	]}
>
	{#snippet extra()}
		{#if s.fileKey}
			<section class="panel">
				<div class="panel__body">
					<a class="btn btn--outline btn--sm" href="/admin/archivos/{s.fileKey.replace(/^private\//, '')}?nombre={encodeURIComponent(s.fileName ?? 'documento')}"><Icon name="download" size={14} /> {s.fileName}</a>
				</div>
			</section>
		{/if}
	{/snippet}
</InboxDetail>
