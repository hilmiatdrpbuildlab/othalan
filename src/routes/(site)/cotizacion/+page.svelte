<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { enhance } from '$app/forms';
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Field from '$lib/components/form/Field.svelte';
	import FormGuard from '$lib/components/form/FormGuard.svelte';
	import ErrorSummary from '$lib/components/form/ErrorSummary.svelte';
	import Breadcrumb from '$lib/components/navigation/Breadcrumb.svelte';
	import { BUDGET_RANGES, REGIONES, SECTORES } from '$lib/utils/chile';
	import { formatBytes } from '$lib/utils/format';
	import { formatRut, isValidRut } from '$lib/utils/rut';
	import { normalizeChileanPhone, phoneDigits } from '$lib/utils/phone';

	let { data, form } = $props();

	const STEPS = ['Contacto', 'Proyecto', 'Detalles y archivos', 'Revisión'];
	const DRAFT_KEY = 'oth_rfq_draft';
	const LABELS: Record<string, string> = {
		contactName: 'Nombre',
		email: 'Correo',
		phone: 'Teléfono',
		rut: 'RUT',
		region: 'Región',
		description: 'Descripción',
		files: 'Archivos',
		consent: 'Consentimiento',
		startDate: 'Fecha'
	};
	const STEP_OF: Record<string, number> = { contactName: 0, email: 0, phone: 0, rut: 0, region: 1, startDate: 1, description: 2, files: 2, consent: 3 };

	const initialService = data.services.find((s) => s.slug === data.preselect)?.id ?? '';
	let v = $state({
		contactName: '',
		company: '',
		rut: '',
		position: '',
		email: '',
		phone: '',
		contactPreference: 'email',
		serviceId: initialService,
		sectors: [] as string[],
		region: '',
		comuna: '',
		startDate: '',
		tenderType: 'no',
		tenderNumber: '',
		description: '',
		areaM2: '',
		steelTons: '',
		budgetRange: ''
	});
	let consent = $state(false);
	let step = $state(0);
	let js = $state(false);
	let sending = $state(false);
	let files = $state<File[]>([]);
	let fileInput: HTMLInputElement | undefined = $state();
	let dragging = $state(false);
	let clientErrors = $state<Record<string, string>>({});
	let stepHeading: HTMLElement | undefined = $state();

	const errors = $derived({ ...(form?.errors ?? {}), ...clientErrors } as Record<string, string>);
	const serviceTitle = $derived(data.services.find((s) => s.id === v.serviceId)?.title ?? 'Otro / no estoy seguro');

	// Restore server-returned values after a failed submit, otherwise the session draft.
	onMount(() => {
		js = true;
		if (form?.values) {
			Object.assign(v, form.values);
			consent = !!form.values.consent;
			const first = Object.keys(form.errors ?? {}).find((k) => k in STEP_OF);
			step = first ? STEP_OF[first] : 3;
			return;
		}
		try {
			const draft = sessionStorage.getItem(DRAFT_KEY);
			if (draft) Object.assign(v, JSON.parse(draft), initialService ? { serviceId: initialService } : {});
		} catch {
			/* ignore */
		}
	});
	$effect(() => {
		const snapshot = JSON.stringify(v);
		if (js) sessionStorage.setItem(DRAFT_KEY, snapshot);
	});

	function validate(s: number): boolean {
		const e: Record<string, string> = {};
		if (s === 0) {
			if (v.contactName.trim().length < 2) e.contactName = 'Ingresa tu nombre.';
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Ingresa un correo válido, por ejemplo nombre@empresa.cl.';
			if (!normalizeChileanPhone(v.phone)) e.phone = 'Ingresa un teléfono chileno válido, por ejemplo +56 9 1234 5678.';
			if (v.rut && !isValidRut(v.rut)) e.rut = 'El RUT no es válido. Revisa el dígito verificador.';
		}
		if (s === 2 && v.description.trim().length < 20) e.description = 'Describe tu proyecto en al menos 20 caracteres.';
		if (s === 3 && !consent) e.consent = 'Debes aceptar la política de privacidad para enviar la solicitud.';
		clientErrors = e;
		return Object.keys(e).length === 0;
	}

	async function goTo(s: number) {
		if (s > step && !validate(step)) return;
		clientErrors = {};
		step = s;
		await tick();
		stepHeading?.focus();
		document.getElementById('rfq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function addFiles(list: FileList | null) {
		if (!list) return;
		const next = [...files, ...Array.from(list)].slice(0, 10);
		files = next;
		syncInput();
	}
	function removeFile(i: number) {
		files = files.filter((_, idx) => idx !== i);
		syncInput();
	}
	function syncInput() {
		if (!fileInput) return;
		const dt = new DataTransfer();
		files.forEach((f) => dt.items.add(f));
		fileInput.files = dt.files;
	}
	const fileProblem = (f: File) => {
		const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
		if (!['pdf', 'dwg', 'dxf', 'jpg', 'jpeg', 'png', 'xlsx', 'xls', 'docx', 'doc', 'zip'].includes(ext)) return 'Formato no permitido';
		if (f.size > 25 * 1024 * 1024) return 'Supera 25 MB';
		return null;
	};
	const show = (s: number) => !js || step === s;
</script>

<Seo title="Solicitar cotización" description="Solicita una cotización para tu proyecto de construcción, montaje industrial, obras civiles o mantención. Respondemos en menos de 24 horas hábiles." />

<section class="rfq-hero" data-theme="dark">
	<div class="container">
		<Breadcrumb items={[{ label: 'Solicitar cotización' }]} />
		<h1 class="display-xl">Solicita tu <mark class="hl">cotización</mark></h1>
		<p class="lead">Cuéntanos sobre tu proyecto. Te respondemos en {data.settings.rfqResponseTime}.</p>
	</div>
</section>

<section class="section rfq-sec" id="rfq">
	<div class="container rfq">
		<div class="rfq__main card">
			{#if js}
				<ol class="stepper" aria-label="Progreso">
					{#each STEPS as label, i (label)}
						<li class:done={i < step} class:active={i === step} aria-current={i === step ? 'step' : undefined}>
							<span class="stepper__dot">{#if i < step}<Icon name="check" size={16} />{:else}{i + 1}{/if}</span>
							<span class="stepper__label">{label}</span>
						</li>
					{/each}
				</ol>
				<p class="stepper__mobile mono">Paso {step + 1} de {STEPS.length} · {STEPS[step]}</p>
			{/if}

			<ErrorSummary errors={Object.keys(clientErrors).length ? clientErrors : form?.errors} labels={LABELS} />

			<form
				method="POST"
				enctype="multipart/form-data"
				novalidate={js}
				use:enhance={({ cancel }) => {
					if (!validate(3)) {
						cancel();
						return;
					}
					sending = true;
					return async ({ result, update }) => {
						if (result.type === 'redirect') sessionStorage.removeItem(DRAFT_KEY);
						await update({ reset: false });
						sending = false;
					};
				}}
			>
				<FormGuard />

				<fieldset hidden={!show(0)}>
					<legend class="h3" tabindex="-1" bind:this={stepHeading}>1. Datos de contacto</legend>
					<div class="form-grid form-grid--2">
						<Field name="contactName" label="Nombre y apellido" required bind:value={v.contactName} error={errors.contactName} autocomplete="name" />
						<Field name="company" label="Empresa" bind:value={v.company} autocomplete="organization" placeholder="Ej: Constructora Andes SpA" />
						<Field
							name="rut"
							label="RUT empresa"
							bind:value={v.rut}
							error={errors.rut}
							help="Opcional. Ej: 76.123.456-7"
							inputmode="text"
							onblur={() => v.rut && (v.rut = formatRut(v.rut))}
						/>
						<Field name="position" label="Cargo" bind:value={v.position} autocomplete="organization-title" />
						<Field name="email" type="email" label="Correo electrónico" required bind:value={v.email} error={errors.email} autocomplete="email" />
						<Field
							name="phone"
							type="tel"
							label="Teléfono"
							required
							bind:value={v.phone}
							error={errors.phone}
							autocomplete="tel"
							placeholder="+56 9 1234 5678"
							onblur={() => {
								const n = normalizeChileanPhone(v.phone);
								if (n) v.phone = n;
							}}
						/>
						<fieldset class="span-2">
							<legend class="field__label">¿Cómo prefieres que te contactemos?</legend>
							<div class="inline-opts">
								{#each [['email', 'Correo'], ['telefono', 'Teléfono'], ['whatsapp', 'WhatsApp']] as [val, lab] (val)}
									<label class="check"><input type="radio" name="contactPreference" value={val} bind:group={v.contactPreference} /> {lab}</label>
								{/each}
							</div>
						</fieldset>
					</div>
				</fieldset>

				<fieldset hidden={!show(1)}>
					<legend class="h3" tabindex="-1">2. Tu proyecto</legend>
					<div class="form-grid">
						<fieldset>
							<legend class="field__label">Tipo de servicio</legend>
							<div class="radio-cards">
								{#each data.services as s (s.id)}
									<label class="radio-card">
										<input type="radio" name="serviceId" value={s.id} bind:group={v.serviceId} />
										<span class="radio-card__icon"><Icon name={s.icon} size={22} /></span>
										<span><strong>{s.title}</strong></span>
									</label>
								{/each}
								<label class="radio-card">
									<input type="radio" name="serviceId" value="" bind:group={v.serviceId} />
									<span class="radio-card__icon"><Icon name="help-circle" size={22} /></span>
									<span><strong>Otro / no estoy seguro</strong><small>Te ayudamos a definirlo</small></span>
								</label>
							</div>
						</fieldset>
						<fieldset>
							<legend class="field__label">Sector</legend>
							<div class="chips">
								{#each SECTORES as s (s)}
									<label class="chip"><input type="checkbox" name="sectors" value={s} bind:group={v.sectors} /><span>{s}</span></label>
								{/each}
							</div>
						</fieldset>
						<div class="form-grid form-grid--2">
							<Field name="region" label="Región" options={REGIONES} bind:value={v.region} error={errors.region} />
							<Field name="comuna" label="Comuna" bind:value={v.comuna} autocomplete="address-level2" />
							<Field name="startDate" type="date" label="Fecha estimada de inicio" bind:value={v.startDate} error={errors.startDate} />
						</div>
						<fieldset>
							<legend class="field__label">¿Es parte de una licitación?</legend>
							<div class="inline-opts">
								{#each [['no', 'No'], ['publica', 'Sí, pública'], ['privada', 'Sí, privada']] as [val, lab] (val)}
									<label class="check"><input type="radio" name="tenderType" value={val} bind:group={v.tenderType} /> {lab}</label>
								{/each}
							</div>
						</fieldset>
						{#if v.tenderType !== 'no' || !js}
							<Field name="tenderNumber" label="N.º o ID de licitación" bind:value={v.tenderNumber} help="Ej: ID Mercado Público 1234-56-LE26" />
						{/if}
					</div>
				</fieldset>

				<fieldset hidden={!show(2)}>
					<legend class="h3" tabindex="-1">3. Detalles y archivos</legend>
					<div class="form-grid">
						<Field
							name="description"
							label="Describe el trabajo que necesitas"
							required
							textarea
							rows={6}
							maxlength={4000}
							bind:value={v.description}
							error={errors.description}
							placeholder="Ej: Montaje de estructura metálica para bodega de 800 m², incluye fundaciones…"
						/>
						<div class="form-grid form-grid--2">
							<Field name="areaM2" label="Superficie estimada" suffix="m²" inputmode="decimal" bind:value={v.areaM2} />
							<Field name="steelTons" label="Acero estimado" suffix="t" inputmode="decimal" bind:value={v.steelTons} />
							<Field name="budgetRange" label="Presupuesto referencial (CLP)" options={BUDGET_RANGES} bind:value={v.budgetRange} />
						</div>
						<div class="field">
							<span class="field__label" id="files-label">Planos, EETT o bases (opcional)</span>
							<label
								class="drop"
								class:drop--over={dragging}
								ondragover={(e) => {
									e.preventDefault();
									dragging = true;
								}}
								ondragleave={() => (dragging = false)}
								ondrop={(e) => {
									e.preventDefault();
									dragging = false;
									addFiles(e.dataTransfer?.files ?? null);
								}}
							>
								<Icon name="upload" size={32} />
								<span><strong>Arrastra tus archivos aquí</strong> o haz clic para seleccionarlos</span>
								<span class="caption">PDF, DWG, DXF, JPG, PNG, XLSX, DOCX o ZIP · máx. 25 MB por archivo · hasta 10 archivos</span>
								<input
									bind:this={fileInput}
									id="f-files"
									class="drop__input"
									type="file"
									name="files"
									multiple
									accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.xlsx,.xls,.docx,.doc,.zip"
									aria-labelledby="files-label"
									onchange={(e) => {
										const list = (e.currentTarget as HTMLInputElement).files;
										files = [];
										addFiles(list);
									}}
								/>
							</label>
							{#if errors.files}<p class="field__error">{errors.files}</p>{/if}
							{#if files.length}
								<ul class="file-list">
									{#each files as f, i (f.name + i)}
										<li class:bad={fileProblem(f)}>
											<Icon name="file" size={18} />
											<span class="file-list__name">{f.name}</span>
											<span class="mono caption">{fileProblem(f) ?? formatBytes(f.size)}</span>
											<button type="button" class="icon-btn" onclick={() => removeFile(i)} aria-label="Quitar {f.name}"><Icon name="trash" size={16} /></button>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					</div>
				</fieldset>

				<fieldset hidden={!show(3)}>
					<legend class="h3" tabindex="-1">4. Revisión y envío</legend>
					{#if js}
						<div class="review">
							{#each [{ s: 0, t: 'Contacto', rows: [['Nombre', v.contactName], ['Empresa', v.company], ['RUT', v.rut], ['Correo', v.email], ['Teléfono', v.phone]] }, { s: 1, t: 'Proyecto', rows: [['Servicio', serviceTitle], ['Sector', v.sectors.join(', ')], ['Ubicación', [v.comuna, v.region].filter(Boolean).join(', ')], ['Inicio', v.startDate], ['Licitación', v.tenderType === 'no' ? 'No' : `${v.tenderType} ${v.tenderNumber}`]] }, { s: 2, t: 'Detalles', rows: [['Descripción', v.description], ['Superficie', v.areaM2 && `${v.areaM2} m²`], ['Acero', v.steelTons && `${v.steelTons} t`], ['Presupuesto', v.budgetRange], ['Archivos', files.length ? `${files.length} archivo(s)` : '']] }] as block (block.s)}
								<div class="review__block">
									<div class="review__head">
										<h3 class="h5">{block.t}</h3>
										<button type="button" class="link-arrow" onclick={() => goTo(block.s)}><Icon name="edit" size={16} /> Editar</button>
									</div>
									<dl>
										{#each block.rows.filter((r) => r[1]) as [k, val] (k)}
											<div><dt>{k}</dt><dd>{val}</dd></div>
										{/each}
									</dl>
								</div>
							{/each}
						</div>
					{/if}
					<label class="check consent">
						<input type="checkbox" name="consent" id="f-consent" bind:checked={consent} aria-invalid={errors.consent ? 'true' : undefined} />
						<span>
							Acepto que {data.settings.companyName} trate mis datos para responder esta solicitud, según la
							<a href="/politica-de-privacidad" target="_blank">Política de privacidad</a> (Ley 19.628 y Ley 21.719). <span class="field__req">*</span>
						</span>
					</label>
					{#if errors.consent}<p class="field__error">{errors.consent}</p>{/if}
				</fieldset>

				<div class="actions">
					{#if js && step > 0}
						<button type="button" class="btn btn--outline" onclick={() => goTo(step - 1)}><Icon name="arrow-left" size={18} /> Atrás</button>
					{:else}
						<span></span>
					{/if}
					{#if js && step < 3}
						<button type="button" class="btn btn--primary" onclick={() => goTo(step + 1)}>Continuar <span class="btn__chip"><Icon name="arrow-right" size={16} /></span></button>
					{:else}
						<button type="submit" class="btn btn--primary btn--lg" disabled={sending} data-loading={sending || undefined} aria-busy={sending}>
							{#if sending}<span class="spinner"></span> Enviando…{:else}Enviar solicitud <span class="btn__chip"><Icon name="arrow-right" size={20} /></span>{/if}
						</button>
					{/if}
				</div>
			</form>
		</div>

		<aside class="rfq__aside">
			<div class="card next" data-theme="dark">
				<h2 class="h4">¿Qué pasa después?</h2>
				<ol>
					<li><strong>Revisamos tu solicitud</strong><span>Un especialista analiza tu proyecto y los antecedentes.</span></li>
					<li><strong>Te contactamos</strong><span>En {data.settings.rfqResponseTime}, por el medio que prefieras.</span></li>
					<li><strong>Visita técnica</strong><span>Si es necesario, coordinamos una visita a terreno.</span></li>
					<li><strong>Propuesta</strong><span>Recibes una cotización detallada y sin compromiso.</span></li>
				</ol>
			</div>
			<div class="card help">
				<p class="h5">¿Prefieres hablar?</p>
				{#if data.settings.whatsapp}
					<a class="btn btn--whatsapp btn--block" href="https://wa.me/{phoneDigits(data.settings.whatsapp)}" target="_blank" rel="noopener">
						<Icon name="brand-whatsapp" size={20} /> WhatsApp
					</a>
				{/if}
				{#if data.settings.phone}<a class="link-arrow" href="tel:+{phoneDigits(data.settings.phone)}"><Icon name="phone" size={16} /> {data.settings.phone}</a>{/if}
				{#if data.settings.email}<a class="link-arrow" href="mailto:{data.settings.email}"><Icon name="mail" size={16} /> {data.settings.email}</a>{/if}
			</div>
		</aside>
	</div>
</section>

<style>
	.rfq-hero {
		background: var(--carbon-900);
		color: var(--white);
		padding: calc(64px + var(--space-12)) 0 var(--space-16);
	}
	@media (min-width: 1100px) {
		.rfq-hero {
			padding-top: calc(88px + var(--space-16));
		}
	}
	.rfq-hero .container {
		display: grid;
		gap: var(--space-4);
	}
	.rfq-hero .lead {
		color: var(--concrete-200);
	}
	.rfq-sec {
		padding-top: 0;
	}
	.rfq {
		display: grid;
		gap: var(--space-8);
		margin-top: calc(var(--space-8) * -1);
	}
	@media (min-width: 1024px) {
		.rfq {
			grid-template-columns: 8fr 4fr;
		}
	}
	.rfq__main {
		padding: clamp(1.25rem, 0.5rem + 3vw, 2.5rem);
	}
	.stepper {
		list-style: none;
		padding: 0;
		display: none;
		gap: var(--space-2);
		margin-bottom: var(--space-8);
	}
	@media (min-width: 720px) {
		.stepper {
			display: flex;
		}
		.stepper__mobile {
			display: none;
		}
	}
	.stepper li {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--color-text-muted);
	}
	.stepper li:not(:last-child)::after {
		content: '';
		flex: 1;
		border-top: 2px dashed var(--color-border-strong);
		margin-inline: var(--space-2);
	}
	.stepper__dot {
		display: grid;
		place-items: center;
		flex: none;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--concrete-100);
		font-weight: 700;
	}
	.stepper .active {
		color: var(--color-text);
		font-weight: 600;
	}
	.stepper .active .stepper__dot {
		background: var(--yellow-500);
		color: var(--carbon-950);
	}
	.stepper .done .stepper__dot {
		background: var(--carbon-900);
		color: var(--yellow-500);
	}
	.stepper__label {
		white-space: nowrap;
	}
	.stepper__mobile {
		margin-bottom: var(--space-6);
		padding: var(--space-3) var(--space-4);
		background: var(--yellow-50);
		border-left: 4px solid var(--yellow-500);
	}
	form > fieldset {
		display: grid;
		gap: var(--space-6);
	}
	form > fieldset + fieldset {
		margin-top: var(--space-10);
	}
	form > fieldset[hidden] {
		display: none;
	}
	form > fieldset > legend {
		margin-bottom: var(--space-6);
		text-transform: none;
		outline: none;
	}
	.inline-opts {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--space-6);
	}
	.drop {
		position: relative;
		display: grid;
		justify-items: center;
		gap: var(--space-2);
		min-height: 160px;
		padding: var(--space-6);
		border: 2px dashed var(--concrete-300);
		border-radius: var(--radius-lg);
		background: var(--white);
		text-align: center;
		cursor: pointer;
		transition: all var(--duration-fast);
	}
	.drop--over,
	.drop:hover {
		border-color: var(--yellow-600);
		background: var(--yellow-50);
	}
	.drop:focus-within {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}
	.drop__input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}
	.file-list {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-3);
	}
	.file-list li {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-left: 4px solid var(--yellow-500);
		border-radius: var(--radius-md);
		background: var(--white);
	}
	.file-list li.bad {
		border-left-color: var(--error-600);
		color: var(--error-600);
	}
	.file-list__name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.file-list .icon-btn {
		width: 36px;
		height: 36px;
	}
	.review {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}
	.review__block {
		padding: var(--space-4) var(--space-5);
		border: 1px dashed var(--concrete-300);
		border-radius: var(--radius-md);
		background: var(--concrete-50);
	}
	.review__head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-2);
	}
	.review__head button {
		background: none;
		border: 0;
		padding: 0;
	}
	.review dl div {
		display: grid;
		grid-template-columns: 120px 1fr;
		gap: var(--space-3);
		padding: 4px 0;
		font-size: var(--text-body-sm);
	}
	.review dt {
		color: var(--color-text-muted);
	}
	.review dd {
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
	.consent a {
		color: var(--color-accent-text);
	}
	.actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		margin-top: var(--space-10);
		padding-top: var(--space-6);
		border-top: 1px solid var(--color-border);
	}
	@media (max-width: 719px) {
		.actions {
			position: sticky;
			bottom: 0;
			z-index: 5;
			margin-inline: calc(clamp(1.25rem, 0.5rem + 3vw, 2.5rem) * -1);
			padding: var(--space-3) clamp(1.25rem, 0.5rem + 3vw, 2.5rem);
			background: var(--white);
			box-shadow: 0 -6px 16px rgb(28 27 25 / 0.08);
		}
	}
	.rfq__aside {
		display: grid;
		gap: var(--space-4);
		align-content: start;
	}
	@media (min-width: 1024px) {
		.rfq__aside {
			position: sticky;
			top: 120px;
			align-self: start;
		}
	}
	.next {
		padding: var(--space-6);
		background: var(--carbon-900);
		border-color: var(--carbon-700);
	}
	.next h2 {
		margin-bottom: var(--space-5);
	}
	.next ol {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-4);
		counter-reset: n;
	}
	.next li {
		display: grid;
		gap: 2px;
		padding-left: var(--space-10);
		position: relative;
		counter-increment: n;
		font-size: var(--text-body-sm);
	}
	.next li::before {
		content: counter(n);
		position: absolute;
		left: 0;
		top: 0;
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--yellow-500);
		color: var(--carbon-950);
		font-weight: 700;
	}
	.next span {
		color: var(--concrete-300);
	}
	.next strong {
		color: var(--white);
	}
	.help {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-6);
	}
</style>
