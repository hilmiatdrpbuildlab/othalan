<script lang="ts">
	import { enhance } from '$app/forms';
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Field from '$lib/components/form/Field.svelte';
	import FormGuard from '$lib/components/form/FormGuard.svelte';
	import ErrorSummary from '$lib/components/form/ErrorSummary.svelte';
	import { WHISTLEBLOWER_CATEGORIES } from '$lib/utils/chile';

	let { data, form } = $props();
	const pg = $derived(data.page);
	const v = $derived(form?.values ?? ({} as Record<string, string | boolean>));
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	let anonymous = $state(true);
	let sending = $state(false);
	$effect(() => {
		if (form?.values) anonymous = !!form.values.anonymous;
	});
</script>

<Seo title="Canal de denuncias" description={pg?.intro} />

<PageHero eyebrow="Ética y cumplimiento" title={pg?.title ?? 'Canal de denuncias'} lead={pg?.intro} crumbs={[{ label: 'Canal de denuncias' }]} />

<section class="section">
	<div class="container layout">
		<div class="prose">{@html data.bodyHtml}</div>
		<div class="card formbox">
			{#if form?.success}
				<div class="sent" role="status">
					<Icon name="lock" size={44} />
					<h2 class="h3">Denuncia recibida</h2>
					<p>Guarda este número de folio:</p>
					<p class="folio mono">{form.folio}</p>
					<p class="muted body-sm">Tu denuncia será tratada de forma confidencial.</p>
				</div>
			{:else}
				<h2 class="h3">Realizar una denuncia</h2>
				<p class="body-sm muted note"><Icon name="lock" size={16} /> La información se almacena de forma confidencial y solo es accesible para la administración.</p>
				<ErrorSummary errors={form?.errors} />
				<form
					method="POST"
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
						<Field name="category" label="Tipo de denuncia" required options={WHISTLEBLOWER_CATEGORIES} value={String(v.category ?? '')} error={e.category} />
						<Field name="description" label="Describe los hechos" required textarea rows={7} maxlength={6000} value={String(v.description ?? '')} error={e.description} help="Qué ocurrió, cuándo, dónde y quiénes estuvieron involucrados o fueron testigos." />
						<div class="form-grid form-grid--2">
							<Field name="occurredAt" label="¿Cuándo ocurrió?" value={String(v.occurredAt ?? '')} placeholder="Ej: semana del 6 de octubre" />
							<Field name="location" label="¿Dónde ocurrió?" value={String(v.location ?? '')} placeholder="Ej: faena Quilicura" />
						</div>
						<Field name="peopleInvolved" label="Personas involucradas (opcional)" textarea rows={3} value={String(v.peopleInvolved ?? '')} />
						<label class="check">
							<input type="checkbox" name="anonymous" bind:checked={anonymous} />
							<span>Quiero hacer esta denuncia de forma <strong>anónima</strong></span>
						</label>
						{#if !anonymous}
							<div class="form-grid form-grid--2">
								<Field class="span-2" name="name" label="Nombre" required value={String(v.name ?? '')} error={e.name} />
								<Field name="email" type="email" label="Correo" value={String(v.email ?? '')} error={e.email} />
								<Field name="phone" type="tel" label="Teléfono" value={String(v.phone ?? '')} />
							</div>
						{/if}
					</div>
					<button class="btn btn--primary submit" disabled={sending}>
						{#if sending}<span class="spinner"></span> Enviando…{:else}Enviar denuncia{/if}
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
		margin-bottom: var(--space-2);
	}
	.note {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		margin-bottom: var(--space-6);
	}
	.submit {
		margin-top: var(--space-8);
	}
	.sent {
		display: grid;
		justify-items: center;
		gap: var(--space-3);
		padding: var(--space-10) 0;
		text-align: center;
	}
	.folio {
		padding: var(--space-3) var(--space-6);
		background: var(--carbon-900);
		color: var(--yellow-500);
		border-radius: var(--radius-md);
		font-size: 1.25rem;
	}
</style>
