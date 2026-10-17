<script lang="ts">
	import { onMount } from 'svelte';
	import type { SiteSettings } from '$lib/site-config';

	let { settings, open = $bindable(false) }: { settings: SiteSettings; open?: boolean } = $props();

	const COOKIE = 'oth_consent';
	let decided = $state(true);

	function read(): string | null {
		const m = document.cookie.match(/(?:^|; )oth_consent=([^;]+)/);
		return m ? decodeURIComponent(m[1]) : null;
	}

	function save(value: 'all' | 'necessary') {
		document.cookie = `${COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
		decided = true;
		open = false;
		if (value === 'all') loadAnalytics();
	}

	/** GA4 is optional and only loaded after explicit consent (plan §9.1 / D5). */
	function loadAnalytics() {
		const id = settings.analytics.ga4Id;
		if (!id || document.getElementById('ga4')) return;
		const s = document.createElement('script');
		s.id = 'ga4';
		s.async = true;
		s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
		document.head.appendChild(s);
		const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
		w.dataLayer = w.dataLayer || [];
		w.gtag = function () {
			// eslint-disable-next-line prefer-rest-params
			w.dataLayer.push(arguments);
		};
		w.gtag('js', new Date());
		w.gtag('config', id, { anonymize_ip: true });
	}

	/** Cloudflare Web Analytics is cookieless, so it does not need consent. */
	function loadCloudflareBeacon() {
		const token = settings.analytics.cloudflareToken;
		if (!token || document.getElementById('cf-beacon')) return;
		const s = document.createElement('script');
		s.id = 'cf-beacon';
		s.defer = true;
		s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
		s.dataset.cfBeacon = JSON.stringify({ token });
		document.head.appendChild(s);
	}

	onMount(() => {
		const v = read();
		decided = v !== null;
		loadCloudflareBeacon();
		if (v === 'all') loadAnalytics();
	});
</script>

{#if !decided || open}
	<div class="cookie" role="region" aria-label="Preferencias de cookies">
		<p>
			Usamos cookies necesarias para que el sitio funcione y, solo si lo aceptas, cookies de analítica para mejorarlo.
			<a href="/politica-de-cookies">Más información</a>.
		</p>
		<div class="cookie__actions">
			<button class="btn btn--outline btn--sm" type="button" onclick={() => save('necessary')}>Solo necesarias</button>
			<button class="btn btn--secondary btn--sm" type="button" onclick={() => save('all')}>Aceptar todas</button>
		</div>
	</div>
{/if}

<style>
	.cookie {
		position: fixed;
		left: 16px;
		right: 16px;
		bottom: 16px;
		z-index: var(--z-toast);
		display: grid;
		gap: var(--space-4);
		max-width: 560px;
		padding: var(--space-5);
		background: var(--white);
		border: 1px solid var(--concrete-200);
		border-top: 4px solid var(--yellow-500);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		font-size: var(--text-body-sm);
	}
	.cookie a {
		color: var(--color-accent-text);
	}
	.cookie__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		justify-content: flex-end;
	}
</style>
