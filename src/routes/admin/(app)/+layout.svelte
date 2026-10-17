<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let { data, children } = $props();
	let open = $state(false);

	afterNavigate(() => (open = false));

	const active = (href: string) =>
		href === '/admin' ? page.url.pathname === '/admin' : page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	const initials = $derived(
		data.user.name
			.split(' ')
			.map((p) => p[0])
			.slice(0, 2)
			.join('')
			.toUpperCase()
	);
</script>

<svelte:head><title>Panel | Othalan</title></svelte:head>

<div class="shell" class:shell--open={open}>
	<aside class="side" data-theme="dark" aria-label="Navegación del panel">
		<div class="side__top">
			<a href="/admin" class="side__logo"><Logo tone="dark" size={34} showTagline={false} /></a>
			<button class="side__close icon-btn" onclick={() => (open = false)} aria-label="Cerrar menú"><Icon name="x" size={20} /></button>
		</div>
		<nav class="side__nav">
			{#each data.nav as g (g.label)}
				<div class="side__group">
					{#if g.label}<p class="side__label">{g.label}</p>{/if}
					<ul>
						{#each g.items as item (item.href)}
							<li>
								<a href={item.href} class:active={active(item.href)} aria-current={active(item.href) ? 'page' : undefined}>
									<Icon name={item.icon} size={18} />
									<span>{item.label}</span>
									{#if item.badge}<span class="side__badge">{item.badge}</span>{/if}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</nav>
		<div class="side__foot">
			<a href="/" target="_blank" rel="noopener" class="side__site"><Icon name="external-link" size={16} /> Ver sitio</a>
		</div>
	</aside>
	<button class="scrim" aria-label="Cerrar menú" onclick={() => (open = false)} tabindex="-1"></button>

	<div class="main">
		<header class="top">
			<button class="icon-btn top__burger" onclick={() => (open = true)} aria-label="Abrir menú"><Icon name="menu-2" size={20} /></button>
			<div class="top__spacer"></div>
			<a href="/admin/cuenta" class="top__user">
				<span class="avatar" aria-hidden="true">{initials}</span>
				<span class="top__who"><strong>{data.user.name}</strong><small>{data.roleLabel}</small></span>
			</a>
			<form method="POST" action="/admin/logout">
				<button class="btn btn--ghost btn--sm" type="submit"><Icon name="logout" size={16} /> Salir</button>
			</form>
		</header>
		<main class="content" id="contenido">
			{@render children()}
		</main>
	</div>
</div>

<style>
	.shell {
		min-height: 100vh;
	}
	.side {
		position: fixed;
		inset: 0 auto 0 0;
		z-index: var(--z-drawer);
		display: flex;
		flex-direction: column;
		width: var(--side-w);
		background: var(--carbon-900);
		color: var(--concrete-200);
		transform: translateX(-100%);
		transition: transform var(--duration-slow) var(--ease-standard);
	}
	.shell--open .side {
		transform: none;
	}
	.scrim {
		display: none;
	}
	.shell--open .scrim {
		display: block;
		position: fixed;
		inset: 0;
		z-index: calc(var(--z-drawer) - 1);
		border: 0;
		background: rgb(11 13 12 / 0.5);
	}
	@media (min-width: 1024px) {
		.side {
			transform: none;
		}
		.main {
			margin-left: var(--side-w);
		}
		.side__close,
		.top__burger {
			display: none;
		}
	}
	.side__top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4) var(--space-4) var(--space-3) var(--space-5);
		border-bottom: 1px solid var(--carbon-700);
	}
	.side__logo {
		text-decoration: none;
	}
	.side__close {
		width: 36px;
		height: 36px;
		background: var(--carbon-800);
		color: var(--white);
		border-color: var(--carbon-700);
	}
	.side__nav {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-3) var(--space-3);
	}
	.side__group + .side__group {
		margin-top: var(--space-4);
	}
	.side__label {
		padding: 0 var(--space-3) var(--space-1);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--carbon-500);
	}
	.side ul {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 2px;
	}
	.side a {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: 7px var(--space-3);
		border-radius: var(--radius-md);
		color: var(--concrete-200);
		font-size: 0.875rem;
		text-decoration: none;
	}
	.side a:hover {
		background: var(--carbon-800);
		color: var(--white);
	}
	.side a.active {
		background: var(--carbon-700);
		color: var(--white);
		box-shadow: inset 3px 0 0 var(--yellow-500);
	}
	.side a.active :global(svg) {
		color: var(--yellow-500);
	}
	.side__badge {
		margin-left: auto;
		min-width: 20px;
		padding: 1px 6px;
		border-radius: var(--radius-full);
		background: var(--yellow-500);
		color: var(--carbon-950);
		font-size: 0.6875rem;
		font-weight: 700;
		text-align: center;
	}
	.side__foot {
		padding: var(--space-3) var(--space-5) var(--space-5);
		border-top: 1px solid var(--carbon-700);
	}
	.side__site {
		font-size: 0.8125rem;
	}
	.top {
		position: sticky;
		top: 0;
		z-index: var(--z-header);
		display: flex;
		align-items: center;
		gap: var(--space-3);
		height: 60px;
		padding: 0 var(--space-5);
		background: rgb(255 255 255 / 0.95);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--concrete-200);
	}
	.top__spacer {
		flex: 1;
	}
	.top__user {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		text-decoration: none;
	}
	.top__who {
		display: none;
		line-height: 1.2;
	}
	@media (min-width: 640px) {
		.top__who {
			display: grid;
		}
	}
	.top__who small {
		color: var(--concrete-600);
		font-size: 0.75rem;
	}
	.avatar {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--yellow-500);
		color: var(--carbon-950);
		font-weight: 700;
		font-size: 0.8125rem;
	}
	.content {
		padding: var(--space-6) var(--space-5) var(--space-16);
		max-width: 1280px;
	}
	@media (min-width: 1024px) {
		.content {
			padding: var(--space-8) var(--space-8) var(--space-16);
		}
	}
</style>
