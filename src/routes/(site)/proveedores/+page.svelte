<script lang="ts">
	import { enhance } from '$app/forms';
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Field from '$lib/components/form/Field.svelte';
	import FormGuard from '$lib/components/form/FormGuard.svelte';
	import ErrorSummary from '$lib/components/form/ErrorSummary.svelte';
	import { REGIONES } from '$lib/utils/chile';

	let { data, form } = $props();
	let sending = $state(false);
	const pg = $derived(data.page);
	const v = $derived(form?.values ?? ({} as Record<string, string | boolean>));
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<Seo title={pg?.seoTitle || 'Proveedores y subcontratistas'} description={pg?.seoDescription || pg?.intro} />

<PageHero eyebrow="Proveedores" title={pg?.title ?? 'Proveedores'} lead={pg?.intro} crumbs={[{ label: 'Proveedores' }]} />

<section class="section">
	<div class="container layout">
		<div class="prose">{@html data.bodyHtml}</div>
		<div class="card formbox">
			{#if form?.success}
				<div class="sent" role="status">
					<Icon name="circle-check" size={48} />
					<h2 class="h3">¡Registro recibido!</h2>
					<p class="muted">Gracias. Te contactaremos cuando surja una oportunidad en tu especialidad.</p>
				</div>
			{:else}
				<h2 class="h3">Registro de proveedores</h2>
				<ErrorSummary errors={form?.errors} />
				<form
					method="POST"
					enctype="multipart/form-data"
					use:enhance={() => {
						sending = true;
						return async ({ update }) => {
							await update({ reset: false });
							sending = false;
						};
					}}
				>
					<FormGuard />
					<div class="form-grid form-grid--2">
						<Field class="span-2" name="companyName" label="Razón social" required value={String(v.companyName ?? '')} error={e.companyName} autocomplete="organization" />
						<Field name="rut" label="RUT empresa" required value={String(v.rut ?? '')} error={e.rut} help="Ej: 76.123.456-7" />
						<Field name="category" label="Rubro / especialidad" required value={String(v.category ?? '')} error={e.category} placeholder="Ej: Arriendo de grúas" />
						<Field name="contactName" label="Nombre de contacto" required value={String(v.contactName ?? '')} error={e.contactName} autocomplete="name" />
						<Field name="email" type="email" label="Correo" required value={String(v.email ?? '')} error={e.email} autocomplete="email" />
						<Field name="phone" type="tel" label="Teléfono" value={String(v.phone ?? '')} error={e.phone} autocomplete="tel" />
						<Field name="region" label="Región" options={REGIONES} value={String(v.region ?? '')} />
						<Field class="span-2" name="website" type="url" label="Sitio web" value={String(v.website ?? '')} placeholder="https://" />
						<div class="field span-2">
							<label class="field__label" for="f-file">Presentación o documentos (opcional)</label>
							<input class="input" id="f-file" type="file" name="file" accept=".pdf,.zip,.docx" />
							<p class="field__help">PDF, ZIP o Word, máximo 10 MB.</p>
							{#if e.file}<p class="field__error">{e.file}</p>{/if}
						</div>
						<Field class="span-2" name="message" label="Comentarios" textarea rows={4} value={String(v.message ?? '')} />
						<div class="span-2">
							<label class="check">
								<input type="checkbox" name="consent" id="f-consent" checked={!!v.consent} />
								<span>Acepto la <a href="/politica-de-privacidad" target="_blank">Política de privacidad</a>. <span class="field__req">*</span></span>
							</label>
							{#if e.consent}<p class="field__error">{e.consent}</p>{/if}
						</div>
					</div>
					<button class="btn btn--primary submit" disabled={sending}>
						{#if sending}<span class="spinner"></span> Enviando…{:else}Registrarme como proveedor <span class="btn__chip"><Icon name="arrow-right" size={16} /></span>{/if}
					</button>
				</form>
			{/if}
		</div>
	</div>
</section>

<style>
	.layout {
		display: grid;
		gap: var(--space-10);
	}
	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: 5fr 7fr;
			gap: var(--space-12);
		}
	}
	.formbox {
		padding: clamp(1.25rem, 0.5rem + 3vw, 2rem);
	}
	.formbox > h2 {
		margin-bottom: var(--space-6);
	}
	.submit {
		margin-top: var(--space-8);
	}
	.check a {
		color: var(--color-accent-text);
	}
	.sent {
		display: grid;
		justify-items: center;
		gap: var(--space-4);
		padding: var(--space-10) 0;
		text-align: center;
		color: var(--success-600);
	}
	.sent h2 {
		color: var(--color-heading);
	}
</style>
