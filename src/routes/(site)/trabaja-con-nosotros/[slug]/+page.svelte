<script lang="ts">
	import { enhance } from '$app/forms';
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Field from '$lib/components/form/Field.svelte';
	import FormGuard from '$lib/components/form/FormGuard.svelte';
	import ErrorSummary from '$lib/components/form/ErrorSummary.svelte';
	import { REGIONES } from '$lib/utils/chile';
	import { formatDate } from '$lib/utils/format';
	import { page } from '$app/state';

	let { data, form } = $props();
	const job = $derived(data.job);
	let sending = $state(false);
	const v = $derived(form?.values ?? ({} as Record<string, string | boolean>));
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	const title = $derived(job?.title ?? 'Postulación espontánea');
	const jsonLd = $derived(
		job
			? {
					'@context': 'https://schema.org',
					'@type': 'JobPosting',
					title: job.title,
					description: data.bodyHtml || job.summary || job.title,
					datePosted: new Date(job.publishedAt ?? job.createdAt).toISOString().slice(0, 10),
					...(job.closesAt ? { validThrough: job.closesAt } : {}),
					employmentType: job.contractType === 'Indefinido' ? 'FULL_TIME' : 'CONTRACTOR',
					hiringOrganization: { '@type': 'Organization', name: data.settings.legalName, sameAs: page.url.origin },
					jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location ?? '', addressCountry: 'CL' } }
				}
			: null
	);
</script>

<Seo title={title} description={job?.summary ?? 'Envíanos tu CV para futuras oportunidades en Othalan.'} {jsonLd} noindex={!job} />

<PageHero eyebrow="Trabaja con nosotros" {title} lead={job?.summary} crumbs={[{ href: '/trabaja-con-nosotros', label: 'Trabaja con nosotros' }, { label: title }]}>
	{#if job}
		<p class="meta">
			{#if job.location}<span><Icon name="map-pin" size={16} />{job.location}</span>{/if}
			{#if job.contractType}<span><Icon name="briefcase" size={16} />{job.contractType}</span>{/if}
			{#if job.area}<span><Icon name="users" size={16} />{job.area}</span>{/if}
			{#if job.closesAt}<span><Icon name="calendar" size={16} />Postulaciones hasta el {formatDate(job.closesAt)}</span>{/if}
		</p>
	{/if}
</PageHero>

<section class="section">
	<div class="container layout">
		{#if job}
			<div class="desc">
				{#if data.bodyHtml}<div class="prose">{@html data.bodyHtml}</div>{/if}
				{#if job.requirements.length}
					<h2 class="h4">Requisitos</h2>
					<ul class="req">
						{#each job.requirements as r (r)}<li><Icon name="check" size={18} />{r}</li>{/each}
					</ul>
				{/if}
			</div>
		{/if}

		<div class="card formbox" id="postular">
			{#if form?.success}
				<div class="sent" role="status">
					<Icon name="circle-check" size={48} />
					<h2 class="h3">¡Postulación enviada!</h2>
					<p class="muted">Revisaremos tus antecedentes y te contactaremos si avanzas en el proceso.</p>
					<a class="btn btn--outline" href="/trabaja-con-nosotros">Ver otras ofertas</a>
				</div>
			{:else}
				<h2 class="h3">Postula aquí</h2>
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
					<div class="form-grid">
						{#if !job}<Field name="position" label="Cargo o área de interés" required value={String(v.position ?? '')} error={e.position} />{/if}
						<Field name="name" label="Nombre completo" required value={String(v.name ?? '')} error={e.name} autocomplete="name" />
						<div class="form-grid form-grid--2">
							<Field name="rut" label="RUT" value={String(v.rut ?? '')} error={e.rut} help="Ej: 12.345.678-5" />
							<Field name="phone" type="tel" label="Teléfono" required value={String(v.phone ?? '')} error={e.phone} autocomplete="tel" />
						</div>
						<Field name="email" type="email" label="Correo" required value={String(v.email ?? '')} error={e.email} autocomplete="email" />
						<Field name="region" label="Región de residencia" options={REGIONES} value={String(v.region ?? '')} />
						<div class="field">
							<label class="field__label" for="f-cv">CV <span class="field__req">*</span></label>
							<input class="input" id="f-cv" type="file" name="cv" accept=".pdf,.doc,.docx" required aria-invalid={e.cv ? 'true' : undefined} />
							<p class="field__help">PDF o Word, máximo 5 MB.</p>
							{#if e.cv}<p class="field__error">{e.cv}</p>{/if}
						</div>
						<Field name="message" label="Mensaje (opcional)" textarea rows={4} maxlength={2000} value={String(v.message ?? '')} />
						<div>
							<label class="check">
								<input type="checkbox" name="consent" id="f-consent" checked={!!v.consent} />
								<span>Acepto el tratamiento de mis datos para este proceso de selección, según la <a href="/politica-de-privacidad" target="_blank">Política de privacidad</a>. <span class="field__req">*</span></span>
							</label>
							{#if e.consent}<p class="field__error">{e.consent}</p>{/if}
						</div>
					</div>
					<button class="btn btn--primary btn--block submit" disabled={sending} aria-busy={sending}>
						{#if sending}<span class="spinner"></span> Enviando…{:else}Enviar postulación <span class="btn__chip"><Icon name="arrow-right" size={16} /></span>{/if}
					</button>
				</form>
			{/if}
		</div>
	</div>
</section>

<style>
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-6);
		color: var(--concrete-200);
	}
	.meta span {
		display: inline-flex;
		gap: 6px;
		align-items: center;
	}
	.layout {
		display: grid;
		gap: var(--space-10);
	}
	@media (min-width: 1024px) {
		.layout:has(.desc) {
			grid-template-columns: 7fr 5fr;
			gap: var(--space-12);
		}
		.formbox {
			position: sticky;
			top: 120px;
			align-self: start;
		}
	}
	.layout:not(:has(.desc)) .formbox {
		max-width: 640px;
		width: 100%;
		margin-inline: auto;
	}
	.desc {
		display: grid;
		gap: var(--space-6);
		align-content: start;
	}
	.req {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-2);
	}
	.req li {
		display: flex;
		gap: var(--space-2);
	}
	.req :global(svg) {
		flex: none;
		margin-top: 3px;
		color: var(--success-600);
	}
	.formbox {
		padding: clamp(1.25rem, 0.5rem + 3vw, 2rem);
		border-top: 4px solid var(--yellow-500);
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
