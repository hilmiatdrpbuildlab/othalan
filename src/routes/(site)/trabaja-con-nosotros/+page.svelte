<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import { formatDate } from '$lib/utils/format';

	let { data } = $props();
</script>

<Seo title="Trabaja con nosotros" description="Ofertas laborales en Othalan: profesionales, técnicos y personal en terreno para obras en Chile." />

<PageHero eyebrow="Empleo" title="Trabaja *con nosotros*" lead="Buscamos personas comprometidas con la seguridad, la calidad y el trabajo bien hecho." crumbs={[{ label: 'Trabaja con nosotros' }]} />

<section class="section">
	<div class="container container--narrow">
		{#if data.jobs.length}
			<h2 class="h3 title">Ofertas vigentes</h2>
			<ul class="jobs">
				{#each data.jobs as j (j.id)}
					<li>
						<a href="/trabaja-con-nosotros/{j.slug}" class="card job">
							<div>
								<h3 class="h4">{j.title}</h3>
								<p class="meta body-sm">
									{#if j.location}<span><Icon name="map-pin" size={16} />{j.location}</span>{/if}
									{#if j.contractType}<span><Icon name="briefcase" size={16} />{j.contractType}</span>{/if}
									{#if j.closesAt}<span><Icon name="calendar" size={16} />Hasta el {formatDate(j.closesAt)}</span>{/if}
								</p>
								{#if j.summary}<p class="muted body-sm">{j.summary}</p>{/if}
							</div>
							<span class="icon-btn icon-btn--brand" aria-hidden="true"><Icon name="arrow-right" size={20} /></span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="empty card">
				<Icon name="helmet" size={48} />
				<h2 class="h4">No hay ofertas abiertas en este momento</h2>
				<p class="muted">Puedes enviarnos tu CV y te contactaremos cuando surja una oportunidad acorde a tu perfil.</p>
			</div>
		{/if}
		<div class="spont card">
			<div>
				<h2 class="h4">Postulación espontánea</h2>
				<p class="muted body-sm">¿No encuentras un cargo para ti? Déjanos tus datos y tu CV.</p>
			</div>
			<a href="/trabaja-con-nosotros/postulacion-espontanea" class="btn btn--secondary">Enviar CV <span class="btn__chip"><Icon name="arrow-right" size={16} /></span></a>
		</div>
	</div>
</section>

<style>
	.title {
		margin-bottom: var(--space-6);
	}
	.jobs {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-3);
	}
	.job {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-5) var(--space-6);
		text-decoration: none;
		transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
	}
	@media (hover: hover) {
		.job:hover {
			border-color: var(--carbon-900);
			box-shadow: var(--shadow-md);
		}
	}
	.job > div {
		display: grid;
		gap: var(--space-2);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-5);
		color: var(--color-text-muted);
	}
	.meta span {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.empty {
		display: grid;
		justify-items: center;
		gap: var(--space-3);
		padding: var(--space-12) var(--space-6);
		text-align: center;
	}
	.spont {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
		margin-top: var(--space-8);
		padding: var(--space-6);
		background: var(--yellow-50);
		border-color: var(--yellow-200);
	}
</style>
