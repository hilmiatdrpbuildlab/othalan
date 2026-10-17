<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import { formatDateTime } from '$lib/utils/format';

	let { data, form } = $props();
	const u = $derived(data.u);
</script>

<svelte:head><title>{u.name} | Usuarios | Panel Othalan</title></svelte:head>
<Toast />

<div class="adm-page-head">
	<div>
		<a href="/admin/usuarios" class="link-arrow"><Icon name="arrow-left" size={14} /> Usuarios</a>
		<h1>{u.name}</h1>
		<p>{u.email} · creado {formatDateTime(u.createdAt)} · último ingreso {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '—'}</p>
	</div>
</div>

{#if form?.error}<div class="alert alert--error msg"><Icon name="alert-circle" size={18} /><span>{form.error}</span></div>{/if}
{#if form?.password}
	<div class="alert alert--success msg"><Icon name="key" size={18} /><span>Nueva contraseña temporal: <code class="mono">{form.password}</code> — compártela por un canal seguro. Se cerraron sus sesiones activas.</span></div>
{/if}

<div class="cols">
	<form method="POST" action="?/save" class="panel" use:enhance>
		<div class="panel__head"><h2>Datos y permisos</h2></div>
		<div class="panel__body form-grid">
			<div class="field"><label class="field__label" for="n">Nombre</label><input class="input" id="n" name="name" value={u.name} required /></div>
			<div class="field">
				<label class="field__label" for="r">Rol</label>
				<select class="select" id="r" name="role" value={u.role}>
					{#each Object.entries(data.roles) as [k, l] (k)}<option value={k}>{l}</option>{/each}
				</select>
			</div>
			<label class="switch"><input type="checkbox" name="active" checked={u.active} /> Usuario activo</label>
			<button class="btn btn--primary">Guardar</button>
		</div>
	</form>
	<form
		method="POST"
		action="?/reset"
		class="panel"
		use:enhance={({ cancel }) => {
			if (!confirm('¿Generar una nueva contraseña temporal para este usuario?')) cancel();
		}}
	>
		<div class="panel__head"><h2>Contraseña</h2></div>
		<div class="panel__body form-grid">
			<p class="caption">Genera una contraseña temporal y cierra todas sus sesiones. Úsalo si el usuario la olvidó o se desbloquea tras intentos fallidos.</p>
			<button class="btn btn--outline"><Icon name="key" size={16} /> Restablecer contraseña</button>
		</div>
	</form>
</div>

<style>
	.msg {
		margin-bottom: var(--space-5);
	}
	.cols {
		display: grid;
		gap: var(--space-5);
		align-items: start;
	}
	@media (min-width: 900px) {
		.cols {
			grid-template-columns: 2fr 1fr;
		}
	}
</style>
