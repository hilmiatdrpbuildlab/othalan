<script lang="ts">
	import Img from '$lib/components/media/Img.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import type { PublicMedia } from '$lib/types';

	type Member = {
		id: string;
		name: string;
		roleTitle: string;
		bio: string | null;
		photo: PublicMedia | null;
		linkedinUrl: string | null;
		emailPublic: string | null;
	};
	let { member, headingLevel = 3 }: { member: Member; headingLevel?: 3 | 4 } = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	const BIO_PREVIEW = 160;
	const longBio = $derived((member.bio?.length ?? 0) > BIO_PREVIEW);
	const preview = $derived(longBio ? member.bio!.slice(0, BIO_PREVIEW).replace(/\s+\S*$/, '') + '…' : member.bio);
</script>

<article class="tc">
	<div class="tc__photo">
		<Img media={member.photo} ratio="4/5" sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" width={768} />
	</div>
	<div class="tc__body">
		<svelte:element this={`h${headingLevel}`} class="h4 tc__name">{member.name}</svelte:element>
		<p class="tc__role">{member.roleTitle}</p>
		{#if preview}<p class="body-sm tc__bio">{preview}</p>{/if}
		<div class="tc__actions">
			{#if longBio}
				<button type="button" class="link-arrow tc__more" onclick={() => dialog?.showModal()}>
					Ver perfil <Icon name="arrow-right" size={16} />
				</button>
			{/if}
			<span class="tc__links">
				{#if member.linkedinUrl}
					<a class="icon-btn" href={member.linkedinUrl} target="_blank" rel="noopener" aria-label="LinkedIn de {member.name}">
						<Icon name="brand-linkedin" size={20} />
					</a>
				{/if}
				{#if member.emailPublic}
					<a class="icon-btn" href="mailto:{member.emailPublic}" aria-label="Escribir a {member.name}">
						<Icon name="mail" size={20} />
					</a>
				{/if}
			</span>
		</div>
	</div>
</article>

{#if longBio}
	<dialog class="tc-dialog" bind:this={dialog} aria-labelledby="tm-{member.id}" onclick={(e) => e.target === dialog && dialog?.close()}>
		<div class="tc-dialog__inner">
			<div class="tc-dialog__photo"><Img media={member.photo} ratio="4/5" width={768} /></div>
			<div class="tc-dialog__text">
				<button class="icon-btn tc-dialog__close" type="button" onclick={() => dialog?.close()} aria-label="Cerrar">
					<Icon name="x" size={20} />
				</button>
				<p class="eyebrow">{member.roleTitle}</p>
				<h2 class="h3" id="tm-{member.id}">{member.name}</h2>
				<p class="tc-dialog__bio">{member.bio}</p>
			</div>
		</div>
	</dialog>
{/if}

<style>
	.tc {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		border-bottom: 4px solid transparent;
		transition:
			border-color var(--duration-base),
			box-shadow var(--duration-base);
	}
	.tc__photo {
		overflow: hidden;
	}
	.tc__photo :global(img) {
		filter: grayscale(0.2);
		transition:
			filter var(--duration-slow),
			transform var(--duration-slow) var(--ease-standard);
	}
	@media (hover: hover) {
		.tc:hover {
			border-color: var(--yellow-500);
			box-shadow: var(--shadow-md);
		}
		.tc:hover .tc__photo :global(img) {
			filter: none;
			transform: scale(1.02);
		}
	}
	.tc__body {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: 1;
		padding: var(--space-5) var(--space-6) var(--space-6);
	}
	.tc__role {
		font-size: var(--text-body-sm);
		font-weight: 600;
		color: var(--color-accent-text);
	}
	.tc__bio {
		color: var(--color-text-muted);
	}
	.tc__actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-top: auto;
		padding-top: var(--space-3);
	}
	.tc__more {
		background: none;
		border: 0;
		padding: 0;
		font-size: var(--text-body-sm);
	}
	.tc__links {
		display: flex;
		gap: var(--space-2);
		margin-left: auto;
	}
	.tc__links .icon-btn {
		width: 40px;
		height: 40px;
	}

	.tc-dialog {
		width: min(880px, calc(100% - 32px));
		max-height: calc(100% - 32px);
		padding: 0;
		border: 0;
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
	}
	.tc-dialog::backdrop {
		background: rgb(11 13 12 / 0.7);
	}
	.tc-dialog__inner {
		display: grid;
	}
	@media (min-width: 720px) {
		.tc-dialog__inner {
			grid-template-columns: 2fr 3fr;
		}
	}
	.tc-dialog__text {
		position: relative;
		display: grid;
		align-content: start;
		gap: var(--space-3);
		padding: var(--space-8);
	}
	.tc-dialog__close {
		position: absolute;
		top: var(--space-4);
		right: var(--space-4);
	}
	.tc-dialog__bio {
		white-space: pre-line;
		color: var(--color-text-muted);
		line-height: 1.7;
	}
</style>
