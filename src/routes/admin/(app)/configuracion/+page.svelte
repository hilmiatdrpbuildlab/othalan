<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Toast from '$lib/components/admin/Toast.svelte';
	import MediaField from '$lib/components/admin/MediaField.svelte';
	import ErrorSummary from '$lib/components/form/ErrorSummary.svelte';
	import { REGIONES } from '$lib/utils/chile';
	import type { SiteSettings } from '$lib/site-config';

	let { data, form } = $props();
	let v = $state<SiteSettings>(structuredClone(data.values));
	let media = $state({ ...data.media });
	let saving = $state(false);
	let loaded: unknown = data.values;
	$effect.pre(() => {
		const src = (form?.values as SiteSettings) ?? data.values;
		if (src === loaded) return;
		loaded = src;
		v = structuredClone(src);
	});
	const e = $derived((form?.errors ?? {}) as Record<string, string>);

	type F = { k: string; label: string; help?: string; type?: string; area?: boolean; placeholder?: string; full?: boolean };
	const get = (path: string) => path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], v) as string;
	const set = (path: string, val: string) => {
		const parts = path.split('.');
		const last = parts.pop()!;
		(parts.reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], v) as Record<string, unknown>)[last] = val;
	};

	const groups: { title: string; icon: string; desc?: string; fields: F[] }[] = [
		{
			title: 'Empresa',
			icon: 'building',
			fields: [
				{ k: 'companyName', label: 'Nombre comercial' },
				{ k: 'legalName', label: 'Razón social' },
				{ k: 'rut', label: 'RUT empresa', placeholder: '76.123.456-7' },
				{ k: 'giro', label: 'Giro' },
				{ k: 'foundedYear', label: 'Año de fundación' },
				{ k: 'mutualidad', label: 'Mutualidad (Ley 16.744)', placeholder: 'ACHS / Mutual de Seguridad / IST' },
				{ k: 'tagline', label: 'Frase de marca (pie de página)', full: true },
				{ k: 'description', label: 'Descripción corta (SEO y datos estructurados)', area: true, full: true }
			]
		},
		{
			title: 'Contacto',
			icon: 'phone',
			fields: [
				{ k: 'phone', label: 'Teléfono', placeholder: '+56 2 2345 6789' },
				{ k: 'whatsapp', label: 'WhatsApp', placeholder: '+56 9 1234 5678', help: 'Activa el botón flotante de WhatsApp.' },
				{ k: 'email', label: 'Correo de contacto', type: 'email' },
				{ k: 'hours', label: 'Horario de atención' },
				{ k: 'address', label: 'Dirección', full: true },
				{ k: 'comuna', label: 'Comuna' },
				{ k: 'region', label: 'Región' },
				{ k: 'fieldSupport', label: 'Atención en terreno', placeholder: 'Respuesta en terreno 24/7' },
				{ k: 'serviceArea', label: 'Cobertura', placeholder: 'Todo Chile' },
				{ k: 'rfqResponseTime', label: 'Tiempo de respuesta a cotizaciones', placeholder: 'menos de 24 horas hábiles' },
				{ k: 'whatsappMessage', label: 'Mensaje inicial de WhatsApp', full: true },
				{ k: 'mapEmbedUrl', label: 'Mapa (URL de "Insertar mapa" de Google Maps)', full: true, help: 'En Google Maps: Compartir → Insertar un mapa → copia solo la URL del atributo src.' },
				{ k: 'mapLink', label: 'Enlace "Cómo llegar"', full: true }
			]
		},
		{
			title: 'Redes sociales',
			icon: 'world',
			fields: [
				{ k: 'social.linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/company/…' },
				{ k: 'social.instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/…' },
				{ k: 'social.facebook', label: 'Facebook' },
				{ k: 'social.youtube', label: 'YouTube' }
			]
		},
		{
			title: 'Notificaciones por correo',
			icon: 'mail',
			desc: 'Quién recibe cada formulario. Separa varios correos con coma. Si queda vacío, se usa el correo de contacto.',
			fields: [
				{ k: 'notify.rfq', label: 'Cotizaciones' },
				{ k: 'notify.contact', label: 'Mensajes de contacto' },
				{ k: 'notify.jobs', label: 'Postulaciones' },
				{ k: 'notify.suppliers', label: 'Registro de proveedores' },
				{ k: 'notify.reports', label: 'Canal de denuncias', help: 'Solo personas autorizadas a investigar denuncias.' }
			]
		},
		{
			title: 'SEO',
			icon: 'search',
			fields: [
				{ k: 'seo.defaultTitle', label: 'Título por defecto', full: true },
				{ k: 'seo.defaultDescription', label: 'Descripción por defecto (máx. 160)', area: true, full: true }
			]
		},
		{
			title: 'Analítica',
			icon: 'chart-bar',
			desc: 'Cloudflare Web Analytics no usa cookies. Google Analytics solo se carga si el visitante acepta las cookies.',
			fields: [
				{ k: 'analytics.cloudflareToken', label: 'Token de Cloudflare Web Analytics' },
				{ k: 'analytics.ga4Id', label: 'ID de Google Analytics 4', placeholder: 'G-XXXXXXX' }
			]
		}
	];
</script>

<svelte:head><title>Configuración | Panel Othalan</title></svelte:head>
<Toast />

<form
	method="POST"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
		};
	}}
>
	<div class="adm-page-head">
		<div>
			<p class="eyebrow">Administración</p>
			<h1>Configuración del sitio</h1>
			<p>Estos datos aparecen en el encabezado, el pie de página, la página de contacto y los datos estructurados para Google.</p>
		</div>
		<button class="btn btn--primary" disabled={saving}>{#if saving}<span class="spinner"></span>{:else}<Icon name="device-floppy" size={16} />{/if} Guardar</button>
	</div>

	<ErrorSummary errors={form?.errors} />

	<div class="groups">
		{#each groups as g (g.title)}
			<section class="panel">
				<div class="panel__head"><h2><Icon name={g.icon} size={18} /> {g.title}</h2></div>
				<div class="panel__body">
					{#if g.desc}<p class="caption desc">{g.desc}</p>{/if}
					<div class="grid">
						{#each g.fields as f (f.k)}
							<div class="field" class:full={f.full}>
								<label class="field__label" for="f-{f.k}">{f.label}</label>
								{#if f.k === 'region'}
									<select class="select" id="f-{f.k}" name={f.k} value={get(f.k)} onchange={(ev) => set(f.k, ev.currentTarget.value)}>
										<option value="">—</option>
										{#each REGIONES as r (r)}<option value={r}>{r}</option>{/each}
									</select>
								{:else if f.area}
									<textarea class="textarea" id="f-{f.k}" name={f.k} rows="3" value={get(f.k)} oninput={(ev) => set(f.k, ev.currentTarget.value)}></textarea>
								{:else}
									<input
										class="input"
										id="f-{f.k}"
										name={f.k}
										type={f.type ?? 'text'}
										placeholder={f.placeholder}
										value={get(f.k)}
										oninput={(ev) => set(f.k, ev.currentTarget.value)}
										aria-invalid={e[f.k] ? 'true' : undefined}
									/>
								{/if}
								{#if f.help}<p class="field__help">{f.help}</p>{/if}
								{#if e[f.k]}<p class="field__error">{e[f.k]}</p>{/if}
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/each}

		<section class="panel">
			<div class="panel__head"><h2><Icon name="photo" size={18} /> Marca</h2></div>
			<div class="panel__body grid">
				<div class="field">
					<span class="field__label">Logo (opcional)</span>
					<MediaField name="logoId" id="f-logoId" bind:value={v.logoId} bind:mediaMap={media} />
					<p class="field__help">Si lo dejas vacío se usa el emblema vectorial de Othalan. Recomendado: SVG o PNG transparente.</p>
				</div>
				<div class="field">
					<span class="field__label">Imagen para redes sociales (1200×630)</span>
					<MediaField name="seo.ogImageId" id="f-og" bind:value={v.seo.ogImageId} bind:mediaMap={media} />
					<p class="field__help">Se muestra al compartir el sitio en WhatsApp, LinkedIn, etc.</p>
				</div>
			</div>
		</section>

		<section class="panel">
			<div class="panel__head"><h2><Icon name="speakerphone" size={18} /> Banner de anuncio</h2></div>
			<div class="panel__body grid">
				<label class="switch full"><input type="checkbox" name="announcement.enabled" bind:checked={v.announcement.enabled} /> Mostrar banner en la parte superior del sitio</label>
				<div class="field">
					<label class="field__label" for="f-ann-text">Texto</label>
					<input class="input" id="f-ann-text" name="announcement.text" bind:value={v.announcement.text} maxlength="140" />
				</div>
				<div class="field">
					<label class="field__label" for="f-ann-href">Enlace (opcional)</label>
					<input class="input" id="f-ann-href" name="announcement.href" bind:value={v.announcement.href} placeholder="/trabaja-con-nosotros" />
				</div>
			</div>
		</section>
	</div>
</form>

<style>
	.groups {
		display: grid;
		gap: var(--space-5);
	}
	.panel__head h2 {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}
	.desc {
		margin-bottom: var(--space-4);
	}
	.grid {
		display: grid;
		gap: var(--space-4);
	}
	@media (min-width: 800px) {
		.grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	.full {
		grid-column: 1 / -1;
	}
</style>
