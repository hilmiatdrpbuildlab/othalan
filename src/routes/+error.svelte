<script lang="ts">
	import { page } from '$app/state';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head><title>{notFound ? 'Página no encontrada' : 'Error'} | Othalan</title><meta name="robots" content="noindex" /></svelte:head>

<main class="err" data-theme="dark">
	<a href="/" class="err__logo" aria-label="Othalan – Inicio"><Logo tone="dark" size={44} /></a>
	<div class="err__body">
		<div class="barrier" aria-hidden="true"></div>
		<p class="mono err__code">ERROR {page.status}</p>
		<h1 class="display-xl">{notFound ? 'Zona en obra' : 'Algo salió mal'}</h1>
		<p class="lead">
			{notFound
				? 'La página que buscas no existe o fue movida. Te ayudamos a encontrar el camino.'
				: 'Tuvimos un problema al cargar esta página. Inténtalo nuevamente en unos minutos.'}
		</p>
		<div class="err__actions">
			<a href="/" class="btn btn--primary">Ir al inicio <span class="btn__chip"><Icon name="arrow-right" size={16} /></span></a>
			<a href="/proyectos" class="btn btn--secondary">Ver proyectos</a>
			<a href="/contacto" class="btn btn--outline">Contacto</a>
		</div>
	</div>
</main>

<style>
	.err {
		min-height: 100vh;
		display: grid;
		grid-template-rows: auto 1fr;
		gap: var(--space-8);
		padding: var(--space-6) var(--page-margin) var(--space-16);
		background: var(--carbon-900);
		color: var(--white);
	}
	.err__body {
		display: grid;
		align-content: center;
		justify-items: start;
		gap: var(--space-5);
		max-width: 760px;
		margin-inline: auto;
		width: 100%;
	}
	.barrier {
		width: 220px;
		height: 28px;
		border-radius: 4px;
		background: repeating-linear-gradient(-45deg, var(--yellow-500) 0 18px, var(--carbon-950) 18px 36px);
		box-shadow: 0 0 0 3px var(--carbon-950), 0 0 0 4px var(--yellow-500);
	}
	.err__code {
		color: var(--copper-400);
	}
	.err h1 {
		color: var(--white);
	}
	.err .lead {
		color: var(--concrete-300);
	}
	.err__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}
</style>
