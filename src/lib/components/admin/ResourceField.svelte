<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import MediaField from './MediaField.svelte';
	import GalleryField from './GalleryField.svelte';
	import MarkdownField from './MarkdownField.svelte';
	import IconField from './IconField.svelte';
	import { slugify } from '$lib/utils/slug';
	import type { FieldDef, MediaInfo, Option } from '$lib/cms/types';

	type Props = {
		field: FieldDef;
		values: Record<string, unknown>;
		error?: string;
		options?: Option[];
		media: Record<string, MediaInfo>;
	};
	let { field: f, values = $bindable(), error, options = [], media = $bindable() }: Props = $props();

	const id = $derived(`f-${f.name}`);
	const describedBy = $derived([f.help ? `${id}-help` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined);
	const len = $derived(typeof values[f.name] === 'string' ? (values[f.name] as string).length : 0);
	const opts = $derived(f.options ?? options);
	let slugTouched = $state(false);

	// Auto-fill slug from its source field until the user edits it manually.
	$effect(() => {
		if (f.type !== 'slug' || !f.slugFrom || slugTouched) return;
		const src = String(values[f.slugFrom] ?? '');
		if (!values.__existing && src) values[f.name] = slugify(src);
	});
</script>

<div class="rf rf--{f.width ?? 'full'}" class:rf--bool={f.type === 'boolean'}>
	{#if f.type === 'boolean'}
		<label class="switch">
			<input type="checkbox" name={f.name} {id} bind:checked={values[f.name] as boolean} aria-describedby={describedBy} />
			<span>{f.label}{#if f.required}<span class="field__req">*</span>{/if}</span>
		</label>
	{:else}
		<label class="field__label" for={id}>
			{f.label}{#if f.required}<span class="field__req" aria-hidden="true">*</span>{/if}
			{#if f.private}<span class="badge badge--dark priv"><Icon name="lock" size={12} /> Privado</span>{/if}
		</label>

		{#if f.type === 'textarea'}
			<textarea class="textarea" {id} name={f.name} rows="4" bind:value={values[f.name] as string} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} placeholder={f.placeholder}></textarea>
		{:else if f.type === 'markdown'}
			<MarkdownField name={f.name} {id} bind:value={values[f.name] as string} invalid={!!error} describedby={describedBy} />
		{:else if f.type === 'select' || f.type === 'relation'}
			<select class="select" {id} name={f.name} bind:value={values[f.name]} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy}>
				<option value="">— Ninguno —</option>
				{#each opts as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
			</select>
		{:else if f.type === 'status'}
			<select class="select" {id} name={f.name} bind:value={values[f.name]} aria-describedby={describedBy}>
				<option value="draft">Borrador</option>
				<option value="published">Publicado</option>
			</select>
		{:else if f.type === 'multirelation'}
			<div class="multi" {id}>
				{#each opts as o (o.value)}
					<label class="chip">
						<input type="checkbox" name={f.name} value={o.value} bind:group={values[f.name] as string[]} />
						<span>{o.label}</span>
					</label>
				{:else}
					<span class="caption">No hay opciones disponibles.</span>
				{/each}
			</div>
		{:else if f.type === 'image' || f.type === 'file'}
			<MediaField name={f.name} {id} bind:value={values[f.name] as string | null} bind:mediaMap={media} kind={f.type} invalid={!!error} />
		{:else if f.type === 'gallery'}
			<GalleryField name={f.name} {id} bind:value={values[f.name] as { mediaId: string; caption?: string }[]} bind:media />
		{:else if f.type === 'icon'}
			<IconField name={f.name} {id} bind:value={values[f.name] as string} />
		{:else if f.type === 'list'}
			<textarea class="textarea" {id} name={f.name} rows="5" bind:value={values[f.name] as string} aria-describedby={describedBy} placeholder="Un ítem por línea"></textarea>
		{:else if f.type === 'slug'}
			<div class="input-group">
				<span class="input-group__affix">/</span>
				<input
					class="input mono"
					{id}
					name={f.name}
					bind:value={values[f.name] as string}
					oninput={() => (slugTouched = true)}
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={describedBy}
				/>
			</div>
		{:else}
			{@const type = f.type === 'number' || f.type === 'decimal' ? 'text' : f.type === 'datetime' ? 'datetime-local' : f.type}
			<div class:input-group={!!f.suffix}>
				<input
					class="input"
					{id}
					name={f.name}
					{type}
					inputmode={f.type === 'number' ? 'numeric' : f.type === 'decimal' ? 'decimal' : undefined}
					bind:value={values[f.name] as string}
					placeholder={f.placeholder}
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={describedBy}
				/>
				{#if f.suffix}<span class="input-group__affix">{f.suffix}</span>{/if}
			</div>
		{/if}
	{/if}

	<div class="rf__foot">
		{#if f.help}<p class="field__help" id="{id}-help">{f.help}</p>{/if}
		{#if f.max && (f.type === 'text' || f.type === 'textarea')}<span class="caption rf__count" class:over={len > f.max}>{len}/{f.max}</span>{/if}
	</div>
	{#if error}<p class="field__error" id="{id}-err"><Icon name="alert-circle" size={16} />{error}</p>{/if}
</div>

<style>
	.rf {
		display: grid;
		gap: 6px;
		grid-column: 1 / -1;
		align-content: start;
	}
	@media (min-width: 720px) {
		.rf--half {
			grid-column: span 3;
		}
		.rf--third {
			grid-column: span 2;
		}
	}
	.rf--bool {
		align-self: end;
	}
	.rf__foot {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.rf__foot:empty {
		display: none;
	}
	.rf__count {
		margin-left: auto;
	}
	.rf__count.over {
		color: var(--error-600);
		font-weight: 600;
	}
	.multi {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.priv {
		margin-left: var(--space-2);
		vertical-align: middle;
	}
</style>
