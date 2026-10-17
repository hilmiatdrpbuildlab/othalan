<script lang="ts">
	import { enhance } from '$app/forms';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let { form } = $props();
	let loading = $state(false);
	let show = $state(false);
</script>

<svelte:head><title>Ingresar | Panel Othalan</title></svelte:head>

<main class="login">
	<div class="login__brand" data-theme="dark">
		<Logo tone="dark" size={52} />
		<div>
			<p class="eyebrow">Panel de administración</p>
			<h1 class="display-xl">Gestiona el sitio de <mark class="hl">Othalan</mark></h1>
			<p class="muted">Proyectos, equipo, cotizaciones y contenidos en un solo lugar.</p>
		</div>
		<div class="barrier" aria-hidden="true"></div>
	</div>
	<div class="login__form">
		<form
			method="POST"
			class="panel box"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
		>
			<h2 class="h3">Ingresar</h2>
			{#if form?.error}
				<div class="alert alert--error" role="alert"><Icon name="alert-circle" size={18} /><span>{form.error}</span></div>
			{/if}
			<div class="field">
				<label class="field__label" for="email">Correo</label>
				<input class="input" id="email" name="email" type="email" autocomplete="username" required value={form?.email ?? ''} />
			</div>
			<div class="field">
				<label class="field__label" for="password">Contraseña</label>
				<div class="pw">
					<input class="input" id="password" name="password" type={show ? 'text' : 'password'} autocomplete="current-password" required />
					<button type="button" class="pw__toggle" onclick={() => (show = !show)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
						<Icon name={show ? 'eye-off' : 'eye'} size={18} />
					</button>
				</div>
			</div>
			<button class="btn btn--primary btn--block" disabled={loading}>
				{#if loading}<span class="spinner"></span>{/if} Ingresar
			</button>
			<p class="caption">¿Olvidaste tu contraseña? Pide a un administrador que la restablezca.</p>
		</form>
	</div>
</main>

<style>
	.login {
		min-height: 100vh;
		display: grid;
	}
	@media (min-width: 900px) {
		.login {
			grid-template-columns: 1fr 1fr;
		}
	}
	.login__brand {
		display: grid;
		align-content: space-between;
		gap: var(--space-10);
		padding: var(--space-10) clamp(1.5rem, 5vw, 4rem);
		background: var(--carbon-900);
		color: var(--white);
		background-image:
			linear-gradient(rgb(255 255 255 / 0.035) 1px, transparent 1px),
			linear-gradient(90deg, rgb(255 255 255 / 0.035) 1px, transparent 1px);
		background-size: 32px 32px;
	}
	.login__brand > div {
		display: grid;
		gap: var(--space-4);
	}
	.login__brand h1 {
		color: var(--white);
	}
	.barrier {
		height: 16px;
		background: repeating-linear-gradient(-45deg, var(--yellow-500) 0 14px, var(--carbon-950) 14px 28px);
		border-radius: 3px;
	}
	.login__form {
		display: grid;
		place-items: center;
		padding: var(--space-8) var(--space-4);
	}
	.box {
		display: grid;
		gap: var(--space-5);
		width: min(400px, 100%);
		padding: var(--space-8);
		border-top: 4px solid var(--yellow-500);
	}
	.pw {
		position: relative;
	}
	.pw__toggle {
		position: absolute;
		right: 4px;
		top: 50%;
		transform: translateY(-50%);
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border: 0;
		background: none;
		border-radius: var(--radius-sm);
		color: var(--concrete-600);
	}
</style>
