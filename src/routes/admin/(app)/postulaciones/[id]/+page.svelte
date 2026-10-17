<script lang="ts">
	import InboxDetail from '$lib/components/admin/InboxDetail.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { APPLICATION_STATUS } from '$lib/site-config';
	let { data } = $props();
	const a = $derived(data.app);
</script>

<InboxDetail
	back={{ href: '/admin/postulaciones', label: 'Postulaciones' }}
	title={`${a.name} — ${a.position ?? 'Postulación'}`}
	createdAt={a.createdAt}
	status={a.status}
	statuses={APPLICATION_STATUS}
	canWrite={data.canWrite}
	email={a.email}
	notes={a.notes}
	withNotes
	eraseLabel="Eliminar postulación y CV"
	rows={[
		['Cargo', a.position],
		['Nombre', a.name],
		['RUT', a.rut],
		['Correo', a.email],
		['Teléfono', a.phone],
		['Región', a.region],
		['Mensaje', a.message]
	]}
>
	{#snippet extra()}
		{#if a.cvKey}
			<section class="panel">
				<div class="panel__body cv">
					<Icon name="file-text" size={28} />
					<div><strong>{a.cvFilename}</strong><br /><span class="caption">Currículum adjunto</span></div>
					<a class="btn btn--primary btn--sm" href="/admin/archivos/{a.cvKey.replace(/^private\//, '')}?nombre={encodeURIComponent(a.cvFilename ?? 'cv.pdf')}"><Icon name="download" size={14} /> Descargar CV</a>
				</div>
			</section>
		{/if}
	{/snippet}
</InboxDetail>

<style>
	.cv {
		display: flex;
		gap: var(--space-4);
		align-items: center;
	}
	.cv div {
		flex: 1;
	}
</style>
