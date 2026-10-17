<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import { formatDateTime } from '$lib/utils/format';

	let { data, form } = $props();
	let showNew = $state(false);
</script>

<svelte:head><title>Usuarios | Panel Othalan</title></svelte:head>
<Toast />

<div class="adm-page-head">
	<div>
		<p class="eyebrow">Administración</p>
		<h1>Usuarios y roles</h1>
		<p>Administrador: acceso total · Editor: contenidos y medios · Comercial: cotizaciones, mensajes y proveedores · RR. HH.: ofertas y postulaciones.</p>
	</div>
	<button class="btn btn--primary" onclick={() => (showNew = !showNew)}><Icon name="plus" size={16} /> Nuevo usuario</button>
</div>

{#if form?.created}
	<div class="alert alert--success created" role="status">
		<Icon name="circle-check" size={18} />
		<div>
			<p><strong>Usuario creado:</strong> {form.created.email}</p>
			<p>Contraseña temporal: <code class="mono pw">{form.created.password}</code></p>
			<p class="caption">Compártela por un canal seguro. No se volverá a mostrar; el usuario debe cambiarla en "Mi cuenta".</p>
		</div>
	</div>
{/if}

{#if showNew}
	<form method="POST" action="?/create" class="panel newu" use:enhance={() => async ({ update }) => { await update(); showNew = false; }}>
		<div class="panel__body grid">
			<div class="field"><label class="field__label" for="n">Nombre</label><input class="input" id="n" name="name" required /></div>
			<div class="field"><label class="field__label" for="e">Correo</label><input class="input" id="e" name="email" type="email" required /></div>
			<div class="field">
				<label class="field__label" for="r">Rol</label>
				<select class="select" id="r" name="role">
					{#each Object.entries(data.roles) as [k, l] (k)}<option value={k} selected={k === 'editor'}>{l}</option>{/each}
				</select>
			</div>
			<button class="btn btn--primary">Crear</button>
		</div>
		{#if form?.error}<p class="field__error err">{form.error}</p>{/if}
	</form>
{/if}

<div class="panel">
	<div class="table-wrap">
		<table class="table">
			<thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Último ingreso</th></tr></thead>
			<tbody>
				{#each data.rows as u (u.id)}
					<tr>
						<td><a class="row-link" href="/admin/usuarios/{u.id}">{u.name}</a>{#if u.id === data.user.id} <span class="badge">Tú</span>{/if}</td>
						<td>{u.email}</td>
						<td><span class="badge" class:badge--brand={u.role === 'admin'}>{data.roles[u.role]}</span></td>
						<td>{#if u.active}<span class="status-dot" data-s="published">Activo</span>{:else}<span class="status-dot">Inactivo</span>{/if}</td>
						<td class="mono">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.created {
		margin-bottom: var(--space-5);
	}
	.created div {
		display: grid;
		gap: 4px;
	}
	.pw {
		padding: 2px 8px;
		background: var(--white);
		border-radius: var(--radius-xs);
		user-select: all;
	}
	.newu {
		margin-bottom: var(--space-5);
	}
	.grid {
		display: grid;
		gap: var(--space-4);
		align-items: end;
	}
	@media (min-width: 900px) {
		.grid {
			grid-template-columns: 1fr 1fr 1fr auto;
		}
	}
	.err {
		padding: 0 var(--space-5) var(--space-4);
	}
</style>
