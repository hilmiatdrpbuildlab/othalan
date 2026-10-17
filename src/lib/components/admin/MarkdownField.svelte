<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';

	type Props = { name: string; id: string; value: string; invalid?: boolean; describedby?: string };
	let { name, id, value = $bindable(''), invalid = false, describedby }: Props = $props();
	let ta: HTMLTextAreaElement | undefined = $state();
	let tab = $state<'write' | 'preview'>('write');
	let html = $state('');

	function wrap(before: string, after = before, placeholder = 'texto') {
		if (!ta) return;
		const { selectionStart: s, selectionEnd: e } = ta;
		const sel = value.slice(s, e) || placeholder;
		value = value.slice(0, s) + before + sel + after + value.slice(e);
		queueMicrotask(() => {
			ta!.focus();
			ta!.setSelectionRange(s + before.length, s + before.length + sel.length);
		});
	}
	function linePrefix(prefix: string) {
		if (!ta) return;
		const s = ta.selectionStart;
		const lineStart = value.lastIndexOf('\n', s - 1) + 1;
		value = value.slice(0, lineStart) + prefix + value.slice(lineStart);
		queueMicrotask(() => ta!.focus());
	}
	function link() {
		const url = prompt('URL del enlace (https://… o /ruta-interna)');
		if (url) wrap('[', `](${url})`, 'texto del enlace');
	}
	async function preview() {
		tab = 'preview';
		const res = await fetch('/admin/markdown', { method: 'POST', body: value });
		html = res.ok ? await res.text() : '<p>No se pudo generar la vista previa.</p>';
	}
</script>

<div class="md" class:md--invalid={invalid}>
	<div class="md__bar" role="toolbar" aria-label="Formato">
		<button type="button" class:on={tab === 'write'} onclick={() => (tab = 'write')}>Escribir</button>
		<button type="button" class:on={tab === 'preview'} onclick={preview}>Vista previa</button>
		<span class="md__sep"></span>
		{#if tab === 'write'}
			<button type="button" onclick={() => linePrefix('## ')} aria-label="Subtítulo" title="Subtítulo">H2</button>
			<button type="button" onclick={() => linePrefix('### ')} aria-label="Subtítulo menor" title="Subtítulo menor">H3</button>
			<button type="button" onclick={() => wrap('**')} aria-label="Negrita" title="Negrita"><strong>B</strong></button>
			<button type="button" onclick={() => wrap('*')} aria-label="Cursiva" title="Cursiva"><em>I</em></button>
			<button type="button" onclick={() => linePrefix('- ')} aria-label="Lista" title="Lista"><Icon name="list" size={16} /></button>
			<button type="button" onclick={() => linePrefix('> ')} aria-label="Cita" title="Cita"><Icon name="quote" size={16} /></button>
			<button type="button" onclick={link} aria-label="Enlace" title="Enlace"><Icon name="external-link" size={16} /></button>
		{/if}
	</div>
	{#if tab === 'write'}
		<textarea class="textarea md__ta" {id} {name} bind:this={ta} bind:value rows="12" aria-invalid={invalid ? 'true' : undefined} aria-describedby={describedby}></textarea>
	{:else}
		<input type="hidden" {name} {value} />
		<div class="prose md__preview">{@html html}</div>
	{/if}
	<p class="caption md__hint">Formato Markdown: **negrita**, *cursiva*, ## Subtítulo, - lista, [enlace](https://…)</p>
</div>

<style>
	.md {
		border: 1px solid var(--concrete-300);
		border-radius: var(--radius-md);
		background: var(--white);
		overflow: hidden;
	}
	.md--invalid {
		border-color: var(--error-600);
	}
	.md__bar {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		padding: 4px;
		background: var(--concrete-50);
		border-bottom: 1px solid var(--concrete-200);
	}
	.md__bar button {
		min-width: 32px;
		height: 30px;
		padding: 0 8px;
		border: 0;
		border-radius: var(--radius-sm);
		background: none;
		font-size: 0.8125rem;
		display: inline-grid;
		place-items: center;
	}
	.md__bar button:hover {
		background: var(--concrete-100);
	}
	.md__bar button.on {
		background: var(--white);
		box-shadow: var(--shadow-xs);
		font-weight: 600;
	}
	.md__sep {
		width: 1px;
		margin: 4px 6px;
		background: var(--concrete-300);
	}
	.md__ta {
		border: 0 !important;
		border-radius: 0 !important;
		box-shadow: none !important;
		font-family: var(--font-mono);
		font-size: 0.875rem !important;
		line-height: 1.6;
		min-height: 240px !important;
	}
	.md__preview {
		padding: var(--space-4);
		min-height: 240px;
		font-size: 1rem;
	}
	.md__hint {
		padding: 6px 12px;
		border-top: 1px solid var(--concrete-100);
	}
</style>
