<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/ui/Icon.svelte';

	let { data, form } = $props();
</script>

<svelte:head><title>Mi cuenta | Panel Othalan</title></svelte:head>

<div class="adm-page-head">
	<div>
		<h1>Mi cuenta</h1>
		<p>{data.user.name} · {data.user.email} · {data.roleLabel}</p>
	</div>
</div>

<form method="POST" action="?/password" class="panel box" use:enhance={() => async ({ update }) => update({ reset: true })}>
	<div class="panel__head"><h2>Cambiar contraseña</h2></div>
	<div class="panel__body form-grid">
		{#if form?.ok}<div class="alert alert--success"><Icon name="circle-check" size={18} /><span>Contraseña actualizada. Se cerraron tus otras sesiones.</span></div>{/if}
		{#if form?.error}<div class="alert alert--error"><Icon name="alert-circle" size={18} /><span>{form.error}</span></div>{/if}
		<div class="field"><label class="field__label" for="c">Contraseña actual</label><input class="input" id="c" name="current" type="password" autocomplete="current-password" required /></div>
		<div class="field">
			<label class="field__label" for="n">Nueva contraseña</label>
			<input class="input" id="n" name="next" type="password" autocomplete="new-password" minlength="10" required />
			<p class="field__help">Mínimo 10 caracteres, con letras y números.</p>
		</div>
		<div class="field"><label class="field__label" for="k">Repite la nueva contraseña</label><input class="input" id="k" name="confirm" type="password" autocomplete="new-password" required /></div>
		<button class="btn btn--primary">Actualizar contraseña</button>
	</div>
</form>

<style>
	.box {
		max-width: 520px;
	}
</style>
