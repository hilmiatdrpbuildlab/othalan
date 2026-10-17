<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';

	type Props = { href: string; icon: string; title: string; summary?: string | null; index?: number; tone?: 'light' | 'dark' };
	let { href, icon, title, summary, index, tone = 'light' }: Props = $props();
</script>

<a {href} class="svc" data-tone={tone}>
	<span class="svc__icon"><Icon name={icon} size={32} /></span>
	{#if index !== undefined}<span class="mono svc__idx">{String(index + 1).padStart(2, '0')}</span>{/if}
	<h3 class="h4 svc__title">{title}</h3>
	{#if summary}<p class="body-sm svc__sum line-clamp-3">{summary}</p>{/if}
	<span class="link-arrow svc__more">Ver servicio <Icon name="arrow-right" size={16} /></span>
</a>

<style>
	.svc {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		height: 100%;
		padding: var(--space-6);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		overflow: hidden;
		transition:
			transform var(--duration-base) var(--ease-standard),
			box-shadow var(--duration-base) var(--ease-standard),
			border-color var(--duration-base);
	}
	.svc::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 4px;
		background: var(--yellow-500);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform var(--duration-slow) var(--ease-standard);
	}
	.svc__icon {
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		margin-bottom: var(--space-2);
		border-radius: var(--radius-md);
		background: var(--yellow-100);
		color: var(--carbon-950);
		transition: background var(--duration-base);
	}
	.svc__idx {
		color: var(--color-accent-text);
	}
	.svc__title {
		text-transform: uppercase;
	}
	.svc__sum {
		color: var(--color-text-muted);
	}
	.svc__more {
		margin-top: auto;
		padding-top: var(--space-3);
	}
	@media (hover: hover) {
		.svc:hover {
			transform: translateY(-4px);
			box-shadow: var(--shadow-md);
			border-color: var(--color-border-strong);
		}
		.svc:hover::before {
			transform: scaleX(1);
		}
		.svc:hover .svc__icon {
			background: var(--yellow-500);
		}
	}
	.svc:focus-visible::before {
		transform: scaleX(1);
	}
	.svc[data-tone='dark'] .svc__icon {
		background: var(--carbon-700);
		color: var(--yellow-500);
	}
</style>
