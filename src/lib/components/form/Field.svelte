<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Icon from '$lib/components/ui/Icon.svelte';

	type Props = {
		name: string;
		label: string;
		type?: string;
		value?: string | null;
		required?: boolean;
		error?: string | null;
		help?: string;
		textarea?: boolean;
		rows?: number;
		maxlength?: number;
		prefix?: string;
		suffix?: string;
		options?: (string | { value: string; label: string })[];
		placeholder?: string;
		class?: string;
		/** custom control (receives the input id) */
		control?: Snippet<[string]>;
	} & Omit<HTMLInputAttributes, 'value' | 'type' | 'prefix'>;

	let {
		name,
		label,
		type = 'text',
		value = $bindable(''),
		required = false,
		error,
		help,
		textarea = false,
		rows = 5,
		maxlength,
		prefix,
		suffix,
		options,
		placeholder,
		class: className = '',
		control,
		...rest
	}: Props = $props();

	const id = $derived(`f-${name}`);
	const describedBy = $derived([help ? `${id}-help` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined);
	const opts = $derived((options ?? []).map((o) => (typeof o === 'string' ? { value: o, label: o } : o)));
</script>

<div class="field {className}">
	<label class="field__label" for={id}>
		{label}{#if required}<span class="field__req" aria-hidden="true">*</span><span class="sr-only"> (obligatorio)</span>{/if}
	</label>
	{#if control}
		{@render control(id)}
	{:else if textarea}
		<textarea
			class="textarea"
			{id}
			{name}
			{rows}
			{maxlength}
			{placeholder}
			{required}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
		></textarea>
		{#if maxlength}<span class="field__count caption">{(value ?? '').length} / {maxlength}</span>{/if}
	{:else if options}
		<select class="select" {id} {name} {required} bind:value aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy}>
			<option value="">Selecciona…</option>
			{#each opts as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
		</select>
	{:else}
		<div class:input-group={prefix || suffix}>
			{#if prefix}<span class="input-group__affix">{prefix}</span>{/if}
			<input
				class="input"
				{id}
				{name}
				{type}
				{placeholder}
				{required}
				{maxlength}
				bind:value
				aria-invalid={error ? 'true' : undefined}
				aria-describedby={describedBy}
				{...rest}
			/>
			{#if suffix}<span class="input-group__affix">{suffix}</span>{/if}
		</div>
	{/if}
	{#if help}<p class="field__help" id="{id}-help">{help}</p>{/if}
	{#if error}<p class="field__error" id="{id}-err"><Icon name="alert-circle" size={16} />{error}</p>{/if}
</div>

<style>
	.field__count {
		justify-self: end;
		margin-top: -2px;
	}
</style>
