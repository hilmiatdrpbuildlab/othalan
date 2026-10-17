<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Img from '$lib/components/media/Img.svelte';
	import Hero from '$lib/components/sections/Hero.svelte';
	import SectionHeading from '$lib/components/sections/SectionHeading.svelte';
	import ProcessSteps from '$lib/components/sections/ProcessSteps.svelte';
	import CtaBand from '$lib/components/sections/CtaBand.svelte';
	import ServiceCard from '$lib/components/cards/ServiceCard.svelte';
	import ProjectCard from '$lib/components/cards/ProjectCard.svelte';
	import TeamCard from '$lib/components/cards/TeamCard.svelte';
	import StatBlock from '$lib/components/cards/StatBlock.svelte';
	import type { HomeSection, HomeSectionData } from '$lib/site-config';
	import { formatDate, formatInt, formatNumber } from '$lib/utils/format';
	import { mediaUrl } from '$lib/utils/image';
	import { phoneDigits } from '$lib/utils/phone';
	import { page } from '$app/state';

	let { data } = $props();
	const s = $derived(data.settings);
	const enabled = $derived(data.sections.filter((x) => x.enabled));
	const d = <K extends keyof HomeSectionData>(sec: HomeSection, _k: K) => sec.data as HomeSectionData[K];
	const wa = $derived(s.whatsapp ? `https://wa.me/${phoneDigits(s.whatsapp)}?text=${encodeURIComponent(s.whatsappMessage)}` : null);
	const site = $derived(page.url.origin);

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'GeneralContractor',
		name: s.legalName || s.companyName,
		alternateName: s.companyName,
		url: site,
		logo: `${site}/icon-512.png`,
		description: s.description,
		...(s.rut ? { taxID: s.rut } : {}),
		...(s.email ? { email: s.email } : {}),
		...(s.phone ? { telephone: s.phone } : {}),
		...(s.address
			? { address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: s.comuna, addressRegion: s.region, addressCountry: 'CL' } }
			: {}),
		areaServed: { '@type': 'Country', name: 'Chile' },
		sameAs: Object.values(s.social).filter(Boolean),
		employee: data.team.map((m) => ({ '@type': 'Person', name: m.name, jobTitle: m.roleTitle }))
	});
	// Section index numbers ("01 / Servicios")
	const hasData: Record<string, () => boolean> = {
		clients: () => data.clients.length > 0,
		services: () => data.services.length > 0,
		projects: () => data.projects.length > 0,
		team: () => data.team.length > 0,
		testimonials: () => data.testimonials.length > 0
	};
	const numbered = $derived(enabled.filter((x) => !['hero', 'cta', 'clients'].includes(x.key) && (hasData[x.key]?.() ?? true)).map((x) => x.key));
	const idx = (key: string) => String((numbered as string[]).indexOf(key) + 1).padStart(2, '0');
</script>

<Seo title={null} description={s.seo.defaultDescription} imageKey={data.heroImage?.storageKey} {jsonLd} />

{#each enabled as sec (sec.key)}
	{#if sec.key === 'hero'}
		<Hero data={d(sec, 'hero')} image={data.heroImage} />
	{:else if sec.key === 'clients' && data.clients.length}
		{@const c = d(sec, 'clients')}
		<section class="logos section--tight" aria-labelledby="h-clients">
			<div class="container">
				<p class="eyebrow logos__title" id="h-clients">{c.title || c.eyebrow}</p>
				<ul class="logos__list">
					{#each data.clients as client (client.id)}
						<li title={client.name}>
							{#if client.url}
								<a href={client.url} target="_blank" rel="noopener"><img src={mediaUrl(client.logo!.storageKey, { w: 320 })} alt={client.name} loading="lazy" /></a>
							{:else}
								<img src={mediaUrl(client.logo!.storageKey, { w: 320 })} alt={client.name} loading="lazy" />
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{:else if sec.key === 'services' && data.services.length}
		{@const c = d(sec, 'services')}
		<section class="section" aria-labelledby="h-services">
			<div class="container">
				<SectionHeading id="h-services" eyebrow={c.eyebrow} index={idx('services')} title={c.title} lead={c.lead}>
					{#snippet actions()}<a href="/servicios" class="btn btn--outline">Todos los servicios</a>{/snippet}
				</SectionHeading>
				<div class="cards-4">
					{#each data.services as svc, i (svc.id)}
						<ServiceCard href="/servicios/{svc.slug}" icon={svc.icon} title={svc.title} summary={svc.summary} index={i} />
					{/each}
				</div>
			</div>
		</section>
	{:else if sec.key === 'why'}
		{@const c = d(sec, 'why')}
		{@const points = c.points.filter((p) => p.title)}
		<section class="section section--alt blueprint" aria-labelledby="h-why">
			<div class="container why">
				<div class="why__media">
					<span class="corner corner--tl" aria-hidden="true"></span>
					<Img media={data.whyImage} ratio="4/5" sizes="(min-width:1024px) 40vw, 100vw" width={1024} class="why__img" />
					{#if data.stats[0]}
						<div class="why__stat"><StatBlock stat={data.stats[0]} /></div>
					{/if}
				</div>
				<div class="why__text">
					<SectionHeading id="h-why" eyebrow={c.eyebrow} index={idx('why')} title={c.title} lead={c.lead} />
					<ol class="why__list">
						{#each points as p, i (i)}
							<li>
								<span class="why__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
								<div>
									<h3 class="h4">{p.title}</h3>
									{#if p.text}<p class="muted">{p.text}</p>{/if}
								</div>
							</li>
						{/each}
					</ol>
					{#if data.stats.length > 1}
						<div class="why__stats">
							{#each data.stats.slice(1) as st (st.id)}<StatBlock stat={st} variant="plain" />{/each}
						</div>
					{/if}
				</div>
			</div>
		</section>
	{:else if sec.key === 'process'}
		{@const c = d(sec, 'process')}
		<section class="section" aria-labelledby="h-process">
			<div class="container">
				<SectionHeading id="h-process" eyebrow={c.eyebrow} index={idx('process')} title={c.title} lead={c.lead} />
				<ProcessSteps steps={c.steps} />
			</div>
		</section>
	{:else if sec.key === 'projects' && data.projects.length}
		{@const c = d(sec, 'projects')}
		<section class="section section--alt" aria-labelledby="h-projects">
			<div class="container">
				<SectionHeading id="h-projects" eyebrow={c.eyebrow} index={idx('projects')} title={c.title} lead={c.lead}>
					{#snippet actions()}
						<a href="/proyectos" class="btn btn--secondary">Ver todos los proyectos <span class="btn__chip"><Icon name="arrow-right" size={16} /></span></a>
					{/snippet}
				</SectionHeading>
				<div class="bento" data-count={data.projects.length}>
					{#each data.projects as p, i (p.id)}
						<ProjectCard
							class={i === 0 ? 'bento__big' : ''}
							href="/proyectos/{p.slug}"
							title={p.title}
							cover={p.cover}
							category={p.categoryName}
							code={p.code}
							location={[p.comuna, p.region].filter(Boolean).join(', ')}
							ratio={i === 0 ? undefined : '4/3'}
							specs={false}
							sizes={i === 0 ? '(min-width:1024px) 50vw, 100vw' : '(min-width:1024px) 25vw, (min-width:768px) 50vw, 100vw'}
						/>
					{/each}
				</div>
			</div>
		</section>
	{:else if sec.key === 'team' && data.team.length}
		{@const c = d(sec, 'team')}
		<section class="section" aria-labelledby="h-team">
			<div class="container">
				<SectionHeading id="h-team" eyebrow={c.eyebrow} index={idx('team')} title={c.title} lead={c.lead}>
					{#snippet actions()}<a href="/nosotros#equipo" class="link-arrow">Conoce al equipo <Icon name="arrow-right" size={16} /></a>{/snippet}
				</SectionHeading>
				<div class="cards-3">
					{#each data.team as m (m.id)}<TeamCard member={m} />{/each}
				</div>
			</div>
		</section>
	{:else if sec.key === 'safety'}
		{@const c = d(sec, 'safety')}
		<section class="section safety" data-theme="dark" aria-labelledby="h-safety">
			<div class="container safety__grid">
				<div>
					<SectionHeading id="h-safety" eyebrow={c.eyebrow} index={idx('safety')} title={c.title} lead={c.lead} />
					<a href="/seguridad-y-calidad" class="btn btn--outline">Nuestra política de seguridad</a>
				</div>
				<div class="safety__panel">
					{#if data.safety}
						<dl class="safety__kpis">
							{#if data.safety.daysWithoutAccidents !== null}
								<div><dt>Días sin accidentes</dt><dd class="tnum">{formatInt(data.safety.daysWithoutAccidents)}</dd></div>
							{/if}
							{#if data.safety.hhWorked !== null}
								<div><dt>Horas hombre trabajadas</dt><dd class="tnum">{formatInt(data.safety.hhWorked)}</dd></div>
							{/if}
							{#if data.safety.accidentRate !== null}
								<div><dt>Tasa de accidentabilidad</dt><dd class="tnum">{formatNumber(data.safety.accidentRate)}%</dd></div>
							{/if}
						</dl>
						<p class="caption">Indicadores {data.safety.period} · actualizado {formatDate(data.safety.updatedAt)}</p>
					{/if}
					{#if data.certifications.length}
						<ul class="certs">
							{#each data.certifications.slice(0, 6) as cert (cert.id)}
								<li>
									{#if cert.logo}<img src={mediaUrl(cert.logo.storageKey, { w: 160 })} alt="" loading="lazy" />{:else}<Icon name="certificate" size={28} />{/if}
									<span><strong>{cert.name}</strong>{#if cert.issuer}<small>{cert.issuer}</small>{/if}</span>
								</li>
							{/each}
						</ul>
					{/if}
					{#if !data.safety && !data.certifications.length}
						<ul class="pillars">
							<li><Icon name="helmet" size={32} /><span>EPP completo y supervisión en cada faena</span></li>
							<li><Icon name="clipboard-check" size={32} /><span>Análisis de riesgos antes de iniciar</span></li>
							<li><Icon name="award" size={32} /><span>Protocolos de calidad documentados</span></li>
							<li><Icon name="leaf" size={32} /><span>Gestión responsable de residuos</span></li>
						</ul>
					{/if}
				</div>
			</div>
		</section>
	{:else if sec.key === 'testimonials' && data.testimonials.length}
		{@const c = d(sec, 'testimonials')}
		<section class="section section--alt" aria-labelledby="h-testimonials">
			<div class="container">
				<SectionHeading id="h-testimonials" eyebrow={c.eyebrow} index={idx('testimonials')} title={c.title} />
				<ul class="testimonials">
					{#each data.testimonials as tm (tm.id)}
						<li class="card testimonial">
							<span class="testimonial__q" aria-hidden="true">“</span>
							<blockquote><p>{tm.quote}</p></blockquote>
							<footer>
								{#if tm.logo}<img src={mediaUrl(tm.logo.storageKey, { w: 160 })} alt="" loading="lazy" />{/if}
								<span><strong>{tm.authorName}</strong><small>{[tm.authorRole, tm.company ?? tm.clientName].filter(Boolean).join(' · ')}</small></span>
							</footer>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{:else if sec.key === 'cta'}
		{@const c = d(sec, 'cta')}
		<CtaBand title={c.title} text={c.text} label={c.label} href={c.href} whatsapp={wa} />
	{/if}
{/each}

<style>
	.cards-4 {
		display: grid;
		gap: var(--grid-gutter);
	}
	@media (min-width: 768px) {
		.cards-4 {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.cards-4 {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	.cards-3 {
		display: grid;
		gap: var(--grid-gutter);
	}
	@media (min-width: 768px) {
		.cards-3 {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.cards-3 {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* Logo strip */
	.logos {
		border-bottom: 1px solid var(--color-border);
	}
	.logos__title {
		display: flex;
		justify-content: center;
		margin-bottom: var(--space-6);
	}
	.logos__list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: var(--space-8) var(--space-12);
	}
	.logos__list img {
		height: 44px;
		width: auto;
		max-width: 160px;
		object-fit: contain;
		filter: grayscale(1);
		opacity: 0.6;
		transition:
			filter var(--duration-base),
			opacity var(--duration-base);
	}
	@media (hover: hover) {
		.logos__list li:hover img {
			filter: none;
			opacity: 1;
		}
	}

	/* Why */
	.why {
		display: grid;
		gap: var(--space-12);
		align-items: center;
	}
	@media (min-width: 1024px) {
		.why {
			grid-template-columns: 5fr 7fr;
			gap: var(--space-16);
		}
	}
	.why__media {
		position: relative;
		max-width: 520px;
	}
	.why__media :global(.why__img) {
		border-radius: var(--radius-lg);
	}
	.why__stat {
		position: absolute;
		right: -12px;
		bottom: -24px;
		max-width: 240px;
	}
	@media (min-width: 1024px) {
		.why__stat {
			right: -24px;
		}
	}
	.corner {
		position: absolute;
		z-index: 1;
		width: 24px;
		height: 24px;
		border: 0 solid var(--yellow-500);
	}
	.corner--tl {
		top: -10px;
		left: -10px;
		border-width: 3px 0 0 3px;
	}
	.why__text :global(.sh) {
		margin-bottom: var(--space-8);
	}
	.why__list {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-6);
	}
	.why__list li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-5);
		padding-bottom: var(--space-6);
		border-bottom: 1px solid var(--color-border);
	}
	.why__list li:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}
	.why__num {
		min-width: 2.4ch;
		font-variant-numeric: tabular-nums;
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 800;
		line-height: 1;
		color: var(--color-accent-text);
	}
	.why__list h3 {
		margin-bottom: var(--space-1);
	}
	.why__stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-8);
		margin-top: var(--space-10);
		padding-top: var(--space-8);
		border-top: 2px solid var(--color-border-strong);
	}

	/* Bento */
	.bento {
		display: grid;
		gap: var(--grid-gutter);
	}
	@media (min-width: 768px) {
		.bento {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.bento {
			grid-template-columns: repeat(4, 1fr);
			grid-auto-rows: minmax(220px, auto);
		}
		.bento :global(.bento__big) {
			grid-column: span 2;
			grid-row: span 2;
		}
		.bento[data-count='1'] :global(.bento__big) {
			grid-column: span 4;
			grid-row: span 1;
		}
		.bento[data-count='2'] {
			grid-template-columns: repeat(2, 1fr);
		}
		.bento[data-count='2'] :global(.bento__big) {
			grid-column: span 1;
			grid-row: span 1;
		}
		.bento[data-count='3'] :global(> :not(.bento__big)) {
			grid-column: span 2;
		}
	}
	.bento :global(.bento__big .img) {
		min-height: 320px;
	}

	/* Safety */
	.safety {
		background: var(--carbon-900);
	}
	.safety__grid {
		display: grid;
		gap: var(--space-10);
		align-items: center;
	}
	@media (min-width: 1024px) {
		.safety__grid {
			grid-template-columns: 5fr 7fr;
			gap: var(--space-16);
		}
	}
	.safety__panel {
		display: grid;
		gap: var(--space-6);
	}
	.safety__kpis {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	}
	.safety__kpis div {
		padding: var(--space-5);
		border: 1px solid var(--carbon-700);
		border-top: 4px solid var(--yellow-500);
		border-radius: var(--radius-lg);
		background: var(--carbon-800);
	}
	.safety__kpis dt {
		font-size: var(--text-caption);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--concrete-300);
	}
	.safety__kpis dd {
		font-family: var(--font-display);
		font-size: var(--text-h1);
		font-weight: 800;
		color: var(--yellow-500);
	}
	.certs,
	.pillars {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-3);
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}
	.certs li,
	.pillars li {
		display: flex;
		gap: var(--space-4);
		align-items: center;
		padding: var(--space-4) var(--space-5);
		border: 1px solid var(--carbon-700);
		border-radius: var(--radius-lg);
		background: var(--carbon-800);
		color: var(--concrete-100);
	}
	.certs img {
		width: 48px;
		height: 48px;
		object-fit: contain;
		background: var(--white);
		border-radius: var(--radius-sm);
		padding: 4px;
	}
	.certs :global(svg),
	.pillars :global(svg) {
		flex: none;
		color: var(--yellow-500);
	}
	.certs strong,
	.certs small {
		display: block;
	}
	.certs small {
		color: var(--concrete-400);
	}

	/* Testimonials */
	.testimonials {
		list-style: none;
		padding: 0;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(300px, 1fr);
		gap: var(--grid-gutter);
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		padding-bottom: var(--space-4);
	}
	@media (min-width: 1024px) {
		.testimonials {
			grid-auto-columns: calc((100% - 2 * var(--grid-gutter)) / 3);
		}
	}
	.testimonial {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding: var(--space-8) var(--space-6) var(--space-6);
		scroll-snap-align: start;
	}
	.testimonial__q {
		font-family: Georgia, serif;
		font-size: 4.5rem;
		line-height: 0.6;
		color: var(--yellow-500);
	}
	.testimonial blockquote {
		font-size: var(--text-body-lg);
		line-height: 1.6;
	}
	.testimonial footer {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-top: auto;
	}
	.testimonial footer img {
		width: 44px;
		height: 44px;
		object-fit: contain;
	}
	.testimonial small {
		display: block;
		color: var(--color-text-muted);
	}
</style>
