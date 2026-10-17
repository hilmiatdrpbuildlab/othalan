<script lang="ts">
	import { page } from '$app/state';
	import Header from '$lib/components/navigation/Header.svelte';
	import Footer from '$lib/components/navigation/Footer.svelte';
	import CookieBanner from '$lib/components/navigation/CookieBanner.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { phoneDigits } from '$lib/utils/phone';

	let { data, children } = $props();
	let cookieOpen = $state(false);

	const s = $derived(data.settings);
	const wa = $derived(
		s.whatsapp ? `https://wa.me/${phoneDigits(s.whatsapp)}?text=${encodeURIComponent(s.whatsappMessage)}` : null
	);
	const hideWa = $derived(page.url.pathname.startsWith('/cotizacion'));
</script>

<div id="top"></div>
{#if s.announcement.enabled && s.announcement.text}
	<div class="announce">
		{#if s.announcement.href}<a href={s.announcement.href}>{s.announcement.text} <Icon name="arrow-right" size={16} /></a>
		{:else}<span>{s.announcement.text}</span>{/if}
	</div>
{/if}

<Header settings={s} services={data.navServices} logoKey={data.logoKey} />

<main id="contenido" tabindex="-1">
	{@render children()}
</main>

<Footer settings={s} services={data.navServices} logoKey={data.logoKey} onCookies={() => (cookieOpen = true)} />

{#if wa && !hideWa}
	<a class="wa-float" href={wa} target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">
		<Icon name="brand-whatsapp" size={28} />
	</a>
{/if}

<CookieBanner settings={s} bind:open={cookieOpen} />

<style>
	main {
		display: block;
		outline: none;
	}
	.announce {
		position: relative;
		z-index: calc(var(--z-header) + 1);
		padding: 8px var(--page-margin);
		background: var(--carbon-950);
		color: var(--white);
		text-align: center;
		font-size: var(--text-body-sm);
	}
	.announce a {
		display: inline-flex;
		gap: 6px;
		align-items: center;
		color: var(--yellow-500);
		font-weight: 600;
	}
	.wa-float {
		position: fixed;
		right: 16px;
		bottom: 16px;
		z-index: calc(var(--z-header) - 1);
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--white);
		color: var(--whatsapp);
		border: 1px solid var(--concrete-200);
		box-shadow: var(--shadow-md);
		transition: transform var(--duration-fast);
	}
	@media (min-width: 1024px) {
		.wa-float {
			right: 24px;
			bottom: 24px;
		}
	}
	@media (hover: hover) {
		.wa-float:hover {
			transform: translateY(-2px);
		}
	}
</style>
