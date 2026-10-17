<script lang="ts">
	import { enhance } from '$app/forms';
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Field from '$lib/components/form/Field.svelte';
	import FormGuard from '$lib/components/form/FormGuard.svelte';
	import ErrorSummary from '$lib/components/form/ErrorSummary.svelte';
	import { phoneDigits } from '$lib/utils/phone';

	let { data, form } = $props();
	const s = $derived(data.settings);
	let sending = $state(false);
	let showMap = $state(false);
	const v = $derived(form?.values ?? ({} as Record<string, string | boolean>));
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	const address = $derived([s.address, s.comuna, s.region].filter(Boolean).join(', '));
	const wa = $derived(s.whatsapp ? `https://wa.me/${phoneDigits(s.whatsapp)}?text=${encodeURIComponent(s.whatsappMessage)}` : null);
</script>

<Seo title="Contacto" description="Contáctanos por formulario, teléfono, correo o WhatsApp. Respuesta en terreno 24/7." />

<PageHero eyebrow="Contacto" title="Hablemos de tu *proyecto*" lead="Escríbenos y te respondemos a la brevedad. Si necesitas una cotización formal, usa el formulario de cotización." crumbs={[{ label: 'Contacto' }]} />

<section class="section">
	<div class="container contact">
		<div class="card formbox">
			{#if form?.success}
				<div class="sent" role="status">
					<Icon name="circle-check" size={48} />
					<h2 class="h3">¡Mensaje enviado!</h2>
					<p class="muted">Gracias por escribirnos. Te responderemos pronto a tu correo.</p>
					<a href="/" class="btn btn--outline">Volver al inicio</a>
				</div>
			{:else}
				<h2 class="h3">Envíanos un mensaje</h2>
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
					<div class="form-grid form-grid--2">
						<Field name="name" label="Nombre" required value={String(v.name ?? '')} error={e.name} autocomplete="name" />
						<Field name="company" label="Empresa" value={String(v.company ?? '')} autocomplete="organization" />
						<Field name="email" type="email" label="Correo" required value={String(v.email ?? '')} error={e.email} autocomplete="email" />
						<Field name="phone" type="tel" label="Teléfono" value={String(v.phone ?? '')} error={e.phone} autocomplete="tel" placeholder="+56 9 1234 5678" />
						<Field class="span-2" name="subject" label="Asunto" value={String(v.subject ?? '')} />
						<Field class="span-2" name="message" label="Mensaje" required textarea maxlength={3000} value={String(v.message ?? '')} error={e.message} />
						<div class="span-2">
							<label class="check">
								<input type="checkbox" name="consent" id="f-consent" checked={!!v.consent} />
								<span>Acepto la <a href="/politica-de-privacidad" target="_blank">Política de privacidad</a>. <span class="field__req">*</span></span>
							</label>
							{#if e.consent}<p class="field__error">{e.consent}</p>{/if}
						</div>
					</div>
					<div class="submit">
						<button class="btn btn--primary" disabled={sending} aria-busy={sending}>
							{#if sending}<span class="spinner"></span> Enviando…{:else}Enviar mensaje <span class="btn__chip"><Icon name="arrow-right" size={16} /></span>{/if}
						</button>
						<a href="/cotizacion" class="link-arrow">¿Necesitas una cotización? <Icon name="arrow-right" size={16} /></a>
					</div>
				</form>
			{/if}
		</div>

		<aside class="info">
			<ul class="channels">
				{#if wa}
					<li><a href={wa} target="_blank" rel="noopener" class="channel"><span class="channel__icon wa"><Icon name="brand-whatsapp" size={24} /></span><span><strong>WhatsApp</strong><small>Respuesta rápida</small></span></a></li>
				{/if}
				{#if s.phone}
					<li><a href="tel:+{phoneDigits(s.phone)}" class="channel"><span class="channel__icon"><Icon name="phone" size={24} /></span><span><strong>{s.phone}</strong><small>Llámanos</small></span></a></li>
				{/if}
				{#if s.email}
					<li><a href="mailto:{s.email}" class="channel"><span class="channel__icon"><Icon name="mail" size={24} /></span><span><strong>{s.email}</strong><small>Escríbenos</small></span></a></li>
				{/if}
			</ul>
			<dl class="card details">
				{#if address}<div><dt><Icon name="map-pin" size={18} /> Dirección</dt><dd>{address}</dd></div>{/if}
				{#if s.hours}<div><dt><Icon name="clock" size={18} /> Horario</dt><dd>{s.hours}</dd></div>{/if}
				{#if s.fieldSupport}<div><dt><Icon name="helmet" size={18} /> En terreno</dt><dd>{s.fieldSupport}</dd></div>{/if}
				{#if s.serviceArea}<div><dt><Icon name="map" size={18} /> Cobertura</dt><dd>{s.serviceArea}</dd></div>{/if}
			</dl>
			{#if s.mapEmbedUrl}
				<div class="map">
					{#if showMap}
						<iframe src={s.mapEmbedUrl} title="Mapa de ubicación de {s.companyName}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
					{:else}
						<button type="button" class="map__btn" onclick={() => (showMap = true)}>
							<Icon name="map" size={32} />
							<span>Mostrar mapa</span>
							<small>Se cargará contenido de Google Maps</small>
						</button>
					{/if}
				</div>
			{:else if s.mapLink}
				<a href={s.mapLink} class="btn btn--outline" target="_blank" rel="noopener"><Icon name="map" size={18} /> Ver en el mapa</a>
			{/if}
		</aside>
	</div>
</section>

{#if data.offices.length}
	<section class="section section--alt">
		<div class="container">
			<h2 class="h2 offices-title">Oficinas y talleres</h2>
			<ul class="offices">
				{#each data.offices as o (o.id)}
					<li class="card">
						<h3 class="h5">{o.name}</h3>
						<p>{[o.address, o.comuna, o.region].filter(Boolean).join(', ')}</p>
						{#if o.phone}<p class="mono">{o.phone}</p>{/if}
						{#if o.hours}<p class="body-sm muted">{o.hours}</p>{/if}
						{#if o.mapUrl}<a href={o.mapUrl} target="_blank" rel="noopener" class="link-arrow">Cómo llegar <Icon name="arrow-right" size={16} /></a>{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

<style>
	.contact {
		display: grid;
		gap: var(--space-8);
	}
	@media (min-width: 1024px) {
		.contact {
			grid-template-columns: 7fr 5fr;
			gap: var(--space-12);
		}
	}
	.formbox {
		padding: clamp(1.25rem, 0.5rem + 3vw, 2.5rem);
	}
	.formbox > h2 {
		margin-bottom: var(--space-6);
	}
	.submit {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-6);
		align-items: center;
		margin-top: var(--space-8);
	}
	.check a {
		color: var(--color-accent-text);
	}
	.sent {
		display: grid;
		justify-items: center;
		gap: var(--space-4);
		padding: var(--space-12) 0;
		text-align: center;
		color: var(--success-600);
	}
	.sent h2 {
		color: var(--color-heading);
	}
	.info {
		display: grid;
		gap: var(--space-4);
		align-content: start;
	}
	.channels {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-3);
	}
	.channel {
		display: flex;
		gap: var(--space-4);
		align-items: center;
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color var(--duration-fast);
	}
	@media (hover: hover) {
		.channel:hover {
			border-color: var(--carbon-900);
		}
	}
	.channel small {
		display: block;
		color: var(--color-text-muted);
	}
	.channel strong {
		overflow-wrap: anywhere;
	}
	.channel__icon {
		display: grid;
		place-items: center;
		flex: none;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--yellow-500);
	}
	.channel__icon.wa {
		background: var(--white);
		border: 1px solid var(--concrete-200);
		color: var(--whatsapp);
	}
	.details {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-6);
	}
	.details dt {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		font-size: var(--text-caption);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}
	.map {
		aspect-ratio: 4/3;
		border-radius: var(--radius-lg);
		overflow: hidden;
		border: 1px solid var(--color-border);
	}
	.map iframe {
		width: 100%;
		height: 100%;
		border: 0;
	}
	.map__btn {
		display: grid;
		place-content: center;
		justify-items: center;
		gap: var(--space-2);
		width: 100%;
		height: 100%;
		border: 0;
		background:
			repeating-linear-gradient(135deg, transparent 0 14px, rgb(21 24 26 / 0.04) 14px 15px),
			var(--concrete-50);
	}
	.map__btn small {
		color: var(--color-text-muted);
	}
	.offices-title {
		margin-bottom: var(--space-8);
	}
	.offices {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--grid-gutter);
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	}
	.offices li {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-6);
	}
</style>
