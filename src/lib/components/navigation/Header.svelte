<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import type { SiteSettings } from '$lib/site-config';
	import { phoneDigits } from '$lib/utils/phone';

	type NavService = { slug: string; title: string; icon: string; summary: string | null };
	let { settings, services, logoKey }: { settings: SiteSettings; services: NavService[]; logoKey: string | null } = $props();

	let menuOpen = $state(false);
	let servicesOpen = $state(false);
	let scrolled = $state(false);
	let hidden = $state(false);
	let lastY = 0;
	let drawer: HTMLDialogElement | undefined = $state();
	let servicesWrap: HTMLElement | undefined = $state();

	const wa = $derived(
		settings.whatsapp
			? `https://wa.me/${phoneDigits(settings.whatsapp)}?text=${encodeURIComponent(settings.whatsappMessage)}`
			: null
	);
	const left = [
		{ href: '/proyectos', label: 'Proyectos' },
		{ href: '/nosotros', label: 'Nosotros' }
	];
	const right = [
		{ href: '/seguridad-y-calidad', label: 'Seguridad' },
		{ href: '/contacto', label: 'Contacto' }
	];
	const drawerLinks = [
		{ href: '/servicios', label: 'Servicios' },
		{ href: '/proyectos', label: 'Proyectos' },
		{ href: '/nosotros', label: 'Nosotros' },
		{ href: '/seguridad-y-calidad', label: 'Seguridad y calidad' },
		{ href: '/clientes', label: 'Clientes' },
		{ href: '/trabaja-con-nosotros', label: 'Trabaja con nosotros' },
		{ href: '/contacto', label: 'Contacto' }
	];

	const isActive = (href: string) => page.url.pathname === href || page.url.pathname.startsWith(href + '/');

	function onScroll() {
		const y = window.scrollY;
		scrolled = y > 80;
		hidden = y > 240 && y > lastY && !servicesOpen;
		lastY = y;
	}

	function openMenu() {
		menuOpen = true;
		drawer?.showModal();
	}
	function closeMenu() {
		menuOpen = false;
		drawer?.close();
	}

	afterNavigate(() => {
		servicesOpen = false;
		if (menuOpen) closeMenu();
	});

	function onWindowClick(e: MouseEvent) {
		if (servicesOpen && servicesWrap && !servicesWrap.contains(e.target as Node)) servicesOpen = false;
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && servicesOpen) servicesOpen = false;
	}
</script>

<svelte:window onscroll={onScroll} onclick={onWindowClick} onkeydown={onKey} />

<a class="skip" href="#contenido">Saltar al contenido</a>

<header class="hdr" class:hdr--scrolled={scrolled} class:hdr--hidden={hidden}>
	<div class="hdr__bar">
		<nav class="hdr__nav hdr__nav--left" aria-label="Principal">
			<div class="dd" bind:this={servicesWrap}>
				<button
					class="nav-link"
					class:active={isActive('/servicios')}
					aria-expanded={servicesOpen}
					aria-controls="mega-servicios"
					onclick={() => (servicesOpen = !servicesOpen)}
				>
					Servicios <Icon name="chevron-down" size={16} />
				</button>
				{#if servicesOpen}
					<div class="mega" id="mega-servicios">
						<ul class="mega__list">
							{#each services as s (s.slug)}
								<li>
									<a href="/servicios/{s.slug}" class="mega__item">
										<span class="mega__icon"><Icon name={s.icon} size={24} /></span>
										<span>
											<strong>{s.title}</strong>
											{#if s.summary}<small class="line-clamp-2">{s.summary}</small>{/if}
										</span>
									</a>
								</li>
							{/each}
						</ul>
						<div class="mega__aside" data-theme="dark">
							<p class="eyebrow">¿No sabes qué necesitas?</p>
							<p>Cuéntanos tu proyecto y te asesoramos sin costo.</p>
							<a href="/servicios" class="link-arrow">Ver todos los servicios <Icon name="arrow-right" size={16} /></a>
						</div>
					</div>
				{/if}
			</div>
			{#each left as l (l.href)}
				<a href={l.href} class="nav-link" class:active={isActive(l.href)} aria-current={isActive(l.href) ? 'page' : undefined}>{l.label}</a>
			{/each}
		</nav>

		<a href="/" class="hdr__logo" aria-label="Othalan Ingeniería y Construcción – Inicio">
			<Logo size={40} customKey={logoKey} />
		</a>

		<div class="hdr__nav hdr__nav--right">
			{#each right as l (l.href)}
				<a href={l.href} class="nav-link" class:active={isActive(l.href)} aria-current={isActive(l.href) ? 'page' : undefined}>{l.label}</a>
			{/each}
			{#if wa}
				<a href={wa} class="icon-btn hdr__wa" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">
					<Icon name="brand-whatsapp" size={22} />
				</a>
			{/if}
			<a href="/cotizacion" class="btn btn--primary btn--sm hdr__cta">
				Solicitar cotización <span class="btn__chip"><Icon name="arrow-right" size={16} /></span>
			</a>
			<button class="icon-btn hdr__burger" onclick={openMenu} aria-label="Abrir menú" aria-expanded={menuOpen}>
				<Icon name="menu-2" size={22} />
			</button>
		</div>
	</div>
</header>

<dialog class="drawer" bind:this={drawer} onclose={() => (menuOpen = false)} data-theme="dark" aria-label="Menú">
	<div class="drawer__top">
		<Logo size={36} tone="dark" customKey={logoKey} />
		<button class="icon-btn" onclick={closeMenu} aria-label="Cerrar menú"><Icon name="x" size={22} /></button>
	</div>
	<nav aria-label="Menú móvil">
		<ol class="drawer__links">
			{#each drawerLinks as l, i (l.href)}
				<li>
					<a href={l.href} aria-current={isActive(l.href) ? 'page' : undefined}>
						<span class="mono">{String(i + 1).padStart(2, '0')}</span>{l.label}
					</a>
				</li>
			{/each}
		</ol>
	</nav>
	<div class="drawer__bottom">
		<a href="/cotizacion" class="btn btn--primary btn--lg btn--block">
			Solicitar cotización <span class="btn__chip"><Icon name="arrow-right" size={20} /></span>
		</a>
		<ul class="drawer__contact">
			{#if settings.phone}<li><Icon name="phone" size={18} /><a href="tel:+{phoneDigits(settings.phone)}">{settings.phone}</a></li>{/if}
			{#if settings.email}<li><Icon name="mail" size={18} /><a href="mailto:{settings.email}">{settings.email}</a></li>{/if}
			{#if wa}<li><Icon name="brand-whatsapp" size={18} /><a href={wa} target="_blank" rel="noopener">WhatsApp</a></li>{/if}
		</ul>
	</div>
</dialog>

<style>
	.skip {
		position: fixed;
		top: 8px;
		left: 8px;
		z-index: 100;
		padding: 10px 16px;
		background: var(--yellow-500);
		color: var(--carbon-950);
		font-weight: 600;
		border-radius: var(--radius-md);
		transform: translateY(-150%);
	}
	.skip:focus {
		transform: none;
	}

	.hdr {
		position: fixed;
		inset: 0 0 auto;
		z-index: var(--z-header);
		padding: 0;
		transition: transform var(--duration-base) var(--ease-standard);
	}
	.hdr--hidden {
		transform: translateY(-110%);
	}
	.hdr__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		height: 64px;
		padding: 0 var(--page-margin);
		background: rgb(255 255 255 / 0.92);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		transition: box-shadow var(--duration-base), background var(--duration-base);
	}
	.hdr--scrolled .hdr__bar {
		background: var(--white);
		box-shadow: var(--shadow-md);
	}
	.hdr__nav {
		display: none;
		align-items: center;
		gap: var(--space-1);
	}
	.hdr__nav--right {
		display: flex;
		gap: var(--space-2);
	}
	.hdr__nav--right .nav-link,
	.hdr__cta,
	.hdr__wa {
		display: none;
	}
	.hdr__logo {
		text-decoration: none;
		border-radius: var(--radius-md);
	}

	@media (min-width: 1100px) {
		.hdr {
			padding: 16px var(--page-margin) 0;
		}
		.hdr__bar {
			display: grid;
			grid-template-columns: 1fr auto 1fr;
			max-width: 1280px;
			height: 72px;
			margin-inline: auto;
			padding: 0 12px 0 20px;
			border-radius: var(--radius-xl);
			box-shadow: var(--shadow-sm);
		}
		.hdr__nav {
			display: flex;
		}
		.hdr__nav--right {
			justify-content: flex-end;
		}
		.hdr__nav--right .nav-link,
		.hdr__cta,
		.hdr__wa {
			display: inline-flex;
		}
		.hdr__burger {
			display: none;
		}
	}

	.nav-link {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 8px 12px;
		border: 0;
		background: none;
		border-radius: 6px;
		color: var(--concrete-800);
		font-size: 0.9375rem;
		font-weight: 500;
		text-decoration: none;
	}
	.nav-link::after {
		content: '';
		position: absolute;
		left: 12px;
		right: 12px;
		bottom: 2px;
		height: 2px;
		background: var(--yellow-500);
		transform: scaleX(0);
		transition: transform var(--duration-base) var(--ease-standard);
	}
	@media (hover: hover) {
		.nav-link:hover {
			color: var(--carbon-950);
		}
		.nav-link:hover::after {
			transform: scaleX(1);
		}
	}
	.nav-link.active {
		color: var(--carbon-950);
		font-weight: 600;
	}
	.nav-link.active::after {
		height: 3px;
		transform: scaleX(1);
	}

	.dd {
		position: relative;
	}
	.mega {
		position: absolute;
		top: calc(100% + 14px);
		left: -12px;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 260px;
		width: min(860px, calc(100vw - 64px));
		background: var(--white);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		animation: drop var(--duration-base) var(--ease-standard);
	}
	@keyframes drop {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
	}
	.mega__list {
		list-style: none;
		padding: var(--space-4);
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-1);
	}
	.mega__item {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		text-decoration: none;
	}
	.mega__item strong {
		display: block;
		font-size: 0.9375rem;
		margin-bottom: 2px;
	}
	.mega__item small {
		color: var(--color-text-muted);
		font-size: 0.8125rem;
		line-height: 1.4;
	}
	.mega__icon {
		flex: none;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: var(--radius-md);
		background: var(--yellow-100);
		transition: background var(--duration-fast);
	}
	@media (hover: hover) {
		.mega__item:hover {
			background: var(--concrete-50);
		}
		.mega__item:hover .mega__icon {
			background: var(--yellow-500);
		}
	}
	.mega__aside {
		display: grid;
		align-content: center;
		gap: var(--space-3);
		padding: var(--space-6);
		background: var(--carbon-900);
		color: var(--concrete-200);
		font-size: 0.9375rem;
	}

	.drawer {
		width: 100%;
		max-width: none;
		height: 100%;
		max-height: none;
		margin: 0;
		padding: var(--space-4) var(--page-margin) var(--space-8);
		border: 0;
		background: var(--carbon-900);
		color: var(--white);
	}
	.drawer[open] {
		display: flex;
		flex-direction: column;
		animation: slide var(--duration-slow) var(--ease-standard);
	}
	@keyframes slide {
		from {
			opacity: 0;
			transform: translateY(-12px);
		}
	}
	.drawer::backdrop {
		background: rgb(11 13 12 / 0.6);
	}
	.drawer__top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-8);
	}
	.drawer .icon-btn {
		background: var(--carbon-800);
		color: var(--white);
		border-color: var(--carbon-700);
	}
	.drawer__links {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-1);
	}
	.drawer__links a {
		display: flex;
		align-items: baseline;
		gap: var(--space-4);
		padding: var(--space-2) 0;
		font-family: var(--font-display);
		font-size: var(--text-h3);
		font-weight: 700;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--white);
	}
	.drawer__links a[aria-current='page'] {
		color: var(--yellow-500);
	}
	.drawer__links .mono {
		color: var(--copper-400);
		font-size: 0.8125rem;
	}
	.drawer__bottom {
		margin-top: auto;
		display: grid;
		gap: var(--space-6);
		padding-top: var(--space-8);
	}
	.drawer__contact {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-3);
		color: var(--concrete-300);
	}
	.drawer__contact li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.drawer__contact a {
		color: var(--white);
	}
</style>
