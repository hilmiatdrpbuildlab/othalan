<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	/** Anti-spam fields shared by every public form: honeypot, render timestamp and Turnstile (if configured). */
	let ts = $state(Date.now());
	const siteKey = env.PUBLIC_TURNSTILE_SITE_KEY;

	onMount(() => {
		ts = Date.now();
		if (siteKey && !document.getElementById('cf-turnstile-js')) {
			const s = document.createElement('script');
			s.id = 'cf-turnstile-js';
			s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
			s.async = true;
			s.defer = true;
			document.head.appendChild(s);
		}
	});
</script>

<div class="hp" aria-hidden="true">
	<label>No completar este campo <input type="text" name="sitio_web" tabindex="-1" autocomplete="off" /></label>
</div>
<input type="hidden" name="_ts" value={ts} />
{#if siteKey}
	<div class="cf-turnstile" data-sitekey={siteKey} data-language="es" data-appearance="interaction-only"></div>
{/if}
