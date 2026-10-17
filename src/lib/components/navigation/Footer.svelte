<script lang="ts">
	import Logo from '$lib/components/ui/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import type { SiteSettings } from '$lib/site-config';
	import { phoneDigits } from '$lib/utils/phone';

	type NavService = { slug: string; title: string };
	let {
		settings,
		services,
		logoKey,
		onCookies
	}: { settings: SiteSettings; services: NavService[]; logoKey: string | null; onCookies: () => void } = $props();

	const year = new Date().getFullYear();
	const wa = $derived(settings.whatsapp ? `https://wa.me/${phoneDigits(settings.whatsapp)}` : null);
	const socials = $derived(
		[
			{ href: settings.social.linkedin, icon: 'brand-linkedin', label: 'LinkedIn' },
			{ href: settings.social.facebook, icon: 'brand-facebook', label: 'Facebook' },
			{ href: settings.social.instagram, icon: 'brand-instagram', label: 'Instagram' },
			{ href: settings.social.youtube, icon: 'brand-youtube', label: 'YouTube' },
			{ href: wa, icon: 'brand-whatsapp', label: 'WhatsApp' }
		].filter((s) => s.href)
	);
	const empresa = [
		{ href: '/nosotros', label: 'Nosotros' },
		{ href: '/proyectos', label: 'Proyectos' },
		{ href: '/clientes', label: 'Clientes' },
		{ href: '/seguridad-y-calidad', label: 'Seguridad y calidad' },
		{ href: '/trabaja-con-nosotros', label: 'Trabaja con nosotros' },
		{ href: '/noticias', label: 'Noticias' },
		{ href: '/descargas', label: 'Descargas' },
		{ href: '/proveedores', label: 'Proveedores' },
		{ href: '/preguntas-frecuentes', label: 'Preguntas frecuentes' }
	];
	const address = $derived([settings.address, settings.comuna, settings.region].filter(Boolean).join(', '));
</script>

<footer class="ftr" data-theme="dark">
	<div class="container ftr__grid">
		<div class="ftr__brand">
			<Logo tone="dark" size={48} customKey={logoKey} />
			<p>{settings.tagline}</p>
			{#if socials.length}
				<ul class="ftr__social" aria-label="Redes sociales">
					{#each socials as s (s.label)}
						<li>
							<a href={s.href} class="icon-btn" target="_blank" rel="noopener" aria-label={s.label}><Icon name={s.icon} size={20} /></a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<details class="ftr__col" open>
			<summary class="h5">Servicios</summary>
			<ul>
				{#each services as s (s.slug)}<li><a href="/servicios/{s.slug}">{s.title}</a></li>{/each}
				<li><a href="/cotizacion">Solicitar cotización</a></li>
			</ul>
		</details>

		<details class="ftr__col" open>
			<summary class="h5">Empresa</summary>
			<ul>
				{#each empresa as l (l.href)}<li><a href={l.href}>{l.label}</a></li>{/each}
			</ul>
		</details>

		<div class="ftr__col ftr__contact">
			<p class="h5">Contacto</p>
			<ul>
				{#if address}<li><Icon name="map-pin" size={18} /><span>{address}</span></li>{/if}
				{#if settings.phone}<li><Icon name="phone" size={18} /><a href="tel:+{phoneDigits(settings.phone)}">{settings.phone}</a></li>{/if}
				{#if settings.email}<li><Icon name="mail" size={18} /><a href="mailto:{settings.email}">{settings.email}</a></li>{/if}
				{#if settings.hours}<li><Icon name="clock" size={18} /><span>{settings.hours}</span></li>{/if}
				{#if settings.fieldSupport}<li class="ftr__badge"><Icon name="helmet" size={18} /><span>{settings.fieldSupport}</span></li>{/if}
			</ul>
		</div>
	</div>

	<div class="ftr__bottom">
		<div class="container ftr__bottom-inner">
			<p>
				© {year}
				{settings.legalName}{#if settings.rut}&nbsp;· RUT {settings.rut}{/if}
			</p>
			<ul>
				<li><a href="/politica-de-privacidad">Política de privacidad</a></li>
				<li><a href="/terminos-y-condiciones">Términos</a></li>
				<li><a href="/politica-de-cookies">Cookies</a></li>
				<li><button type="button" onclick={onCookies}>Preferencias de cookies</button></li>
				<li><a href="/canal-de-denuncias">Canal de denuncias</a></li>
			</ul>
			<a href="#top" class="ftr__top">Volver arriba <Icon name="arrow-up" size={16} /></a>
		</div>
	</div>
</footer>

<style>
	.ftr {
		position: relative;
		overflow: hidden;
		border-top: 4px solid var(--yellow-500);
		background: var(--carbon-900);
		color: var(--concrete-300);
		padding-top: clamp(3.5rem, 2.5rem + 3vw, 5rem);
	}
	.ftr::after {
		/* concentric arcs watermark (logo motif) */
		content: '';
		position: absolute;
		right: -120px;
		top: -60px;
		width: 420px;
		height: 420px;
		border-radius: 50%;
		background: repeating-radial-gradient(circle, transparent 0 34px, rgb(255 255 255 / 0.03) 34px 52px);
		pointer-events: none;
	}
	.ftr__grid {
		position: relative;
		z-index: 1;
		display: grid;
		gap: var(--space-8);
		padding-bottom: var(--space-12);
	}
	@media (min-width: 768px) {
		.ftr__grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (min-width: 1024px) {
		.ftr__grid {
			grid-template-columns: 4fr 2.5fr 2.5fr 3fr;
		}
	}
	.ftr__brand {
		display: grid;
		gap: var(--space-5);
		align-content: start;
		max-width: 22rem;
	}
	.ftr__social {
		list-style: none;
		padding: 0;
		display: flex;
		gap: var(--space-2);
	}
	.ftr__social .icon-btn {
		background: var(--carbon-800);
		border-color: var(--carbon-700);
		color: var(--white);
	}
	.ftr__col .h5,
	.ftr__col summary {
		color: var(--yellow-500);
		margin-bottom: var(--space-4);
		list-style: none;
	}
	.ftr__col summary::-webkit-details-marker {
		display: none;
	}
	.ftr__col ul {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-2);
		font-size: var(--text-body-sm);
	}
	.ftr a,
	.ftr button {
		color: var(--concrete-300);
		text-decoration: none;
		background: none;
		border: 0;
		padding: 0;
		font-size: inherit;
	}
	@media (hover: hover) {
		.ftr a:hover,
		.ftr button:hover {
			color: var(--white);
			text-decoration: underline;
		}
	}
	.ftr__contact li {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
	}
	.ftr__contact :global(svg) {
		flex: none;
		margin-top: 2px;
		color: var(--yellow-500);
	}
	.ftr__badge {
		margin-top: var(--space-2);
		color: var(--white);
		font-weight: 600;
	}
	.ftr__bottom {
		position: relative;
		z-index: 1;
		background: var(--carbon-950);
		padding-block: var(--space-5);
		font-size: var(--text-caption);
	}
	.ftr__bottom-inner {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3) var(--space-8);
		align-items: center;
		justify-content: space-between;
	}
	.ftr__bottom ul {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-5);
	}
	.ftr__top {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}
	.ftr__bottom button {
		cursor: pointer;
	}
</style>
