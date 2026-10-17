<script lang="ts">
	import { page } from '$app/state';
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { phoneDigits } from '$lib/utils/phone';

	let { data } = $props();
	const ticket = $derived((page.url.searchParams.get('ticket') ?? '').replace(/[^A-Z0-9-]/g, '').slice(0, 20));
	const s = $derived(data.settings);
</script>

<Seo title="Solicitud enviada" noindex />

<section class="thanks">
	<div class="container container--form">
		<div class="card box">
			<span class="ok" aria-hidden="true"><Icon name="circle-check" size={56} stroke={1.75} /></span>
			<h1 class="h2">¡Solicitud enviada!</h1>
			{#if ticket}
				<p>Tu número de solicitud es</p>
				<p class="ticket mono">{ticket}</p>
			{/if}
			<p class="muted">
				Te enviamos una confirmación por correo. Nuestro equipo te responderá en {s.rfqResponseTime}.
			</p>
			<div class="actions">
				{#if s.whatsapp}
					<a class="btn btn--whatsapp" href="https://wa.me/{phoneDigits(s.whatsapp)}?text={encodeURIComponent(`Hola, envié la solicitud ${ticket}`)}" target="_blank" rel="noopener">
						<Icon name="brand-whatsapp" size={20} /> Escribir por WhatsApp
					</a>
				{/if}
				<a class="btn btn--secondary" href="/proyectos">Ver proyectos <span class="btn__chip"><Icon name="arrow-right" size={16} /></span></a>
			</div>
		</div>
	</div>
</section>

<style>
	.thanks {
		padding: calc(64px + var(--space-16)) 0 var(--section-py);
		background: var(--concrete-50);
	}
	@media (min-width: 1100px) {
		.thanks {
			padding-top: calc(88px + var(--space-20));
		}
	}
	.box {
		display: grid;
		justify-items: center;
		gap: var(--space-4);
		padding: var(--space-12) var(--space-6);
		text-align: center;
		border-top: 4px solid var(--yellow-500);
	}
	.ok {
		color: var(--success-600);
	}
	.ticket {
		padding: var(--space-3) var(--space-6);
		background: var(--carbon-900);
		color: var(--yellow-500);
		border-radius: var(--radius-md);
		font-size: 1.5rem;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		justify-content: center;
		margin-top: var(--space-4);
	}
</style>
