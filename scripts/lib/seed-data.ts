import sharp from 'sharp';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { eq } from 'drizzle-orm';
import * as t from '../../src/lib/server/db/schema';
import type { DB } from '../../src/lib/server/db/client';
import type { ObjectStorage } from '../../src/lib/server/storage';
import { DEFAULT_HOME, DEFAULT_SETTINGS, HOME_SECTION_ORDER } from '../../src/lib/site-config';
import { hashPassword } from '../../src/lib/server/auth';
import { LEGAL_PAGES } from './legal-pages';

const ROOT = path.resolve('.');

async function uploadImage(
	db: DB,
	storage: ObjectStorage,
	file: string,
	meta: { alt: string; folder: string; caption?: string; focalY?: number; maxWidth?: number }
) {
	const img = sharp(path.join(ROOT, file)).rotate(); // apply EXIF orientation, metadata is stripped on output
	const out = await img
		.resize({ width: meta.maxWidth ?? 2400, withoutEnlargement: true })
		.webp({ quality: 84 })
		.toBuffer({ resolveWithObject: true });
	const { dominant } = await sharp(out.data).stats();
	const hex = '#' + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('');
	const d = new Date();
	const key = `public/media/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.webp`;
	await storage.put(key, out.data, 'image/webp');
	const [row] = await db
		.insert(t.media)
		.values({
			storageKey: key,
			filename: path.basename(file).replace(/\.\w+$/, '.webp'),
			mime: 'image/webp',
			bytes: out.info.size,
			width: out.info.width,
			height: out.info.height,
			alt: meta.alt,
			caption: meta.caption,
			folder: meta.folder,
			focalY: meta.focalY ?? 0.5,
			dominantColor: hex
		})
		.returning({ id: t.media.id });
	return row.id;
}

export async function seed(db: DB, storage: ObjectStorage, opts: { log?: (m: string) => void } = {}) {
	const log = opts.log ?? ((m: string) => console.log(`[seed] ${m}`));

	/* Media */
	const work1 = await uploadImage(db, storage, 'assets/works/44ef73bf-2371-4375-b802-48a436e4558b.jpg', {
		alt: 'Trabajadores con chaleco reflectante instalando una barrera de acero amarilla dentro de un galpón industrial',
		folder: 'proyectos'
	});
	const work2 = await uploadImage(db, storage, 'assets/works/84a57e77-44e4-4dab-b3eb-9aad75f39237.jpg', {
		alt: 'Equipo con protección respiratoria y auditiva cortando pavimento de hormigón con cortadora de piso en un galpón',
		folder: 'proyectos'
	});
	const work3 = await uploadImage(db, storage, 'assets/works/34a3e85b-680b-48d9-8726-894384ad9542.jpg', {
		alt: 'Soldador con máscara de protección trabajando en una estructura metálica en el taller',
		folder: 'proyectos',
		focalY: 0.35
	});
	const team = {
		juan: await uploadImage(db, storage, 'assets/stakeholders/edited/juan-marcelo-escalona-aranda.jpg', {
			alt: 'Retrato de Juan Marcelo Escalona Aranda, Gerente General de Othalan',
			folder: 'equipo',
			focalY: 0.4
		}),
		simon: await uploadImage(db, storage, 'assets/stakeholders/edited/simon-calaf-aguilera.jpg', {
			alt: 'Retrato de Simón Calaf Aguilera, Jefe de Operaciones de Othalan, con chaleco reflectante',
			folder: 'equipo',
			focalY: 0.4
		}),
		consuelo: await uploadImage(db, storage, 'assets/stakeholders/edited/consuelo-escalona.jpg', {
			alt: 'Retrato de Consuelo Escalona, Jefa de Desarrollo de Negocios de Othalan',
			folder: 'equipo',
			focalY: 0.4
		})
	};
	log('media uploaded');

	/* Settings & home */
	await db.insert(t.siteSettings).values({ key: 'site', value: { ...DEFAULT_SETTINGS } });
	const homeData = structuredClone(DEFAULT_HOME);
	homeData.hero.imageId = work1;
	homeData.why.imageId = work2;
	await db.insert(t.homeSections).values(
		HOME_SECTION_ORDER.map((key, i) => ({ key, enabled: true, sortOrder: i, data: homeData[key] as object }))
	);

	/* Taxonomies */
	const cats = await db
		.insert(t.projectCategories)
		.values(
			[
				['construccion', 'Construcción'],
				['industria', 'Industria'],
				['montaje', 'Montaje'],
				['mantencion', 'Mantención'],
				['obras-civiles', 'Obras civiles']
			].map(([slug, name], i) => ({ slug, name, sortOrder: i }))
		)
		.returning();
	const cat = (slug: string) => cats.find((c) => c.slug === slug)!.id;

	/* Services (from the previous othalan.cl) */
	const services = await db
		.insert(t.services)
		.values([
			{
				slug: 'ingenieria-y-planificacion',
				title: 'Ingeniería y planificación',
				icon: 'ruler-measure',
				summary: 'Evaluación técnica, ingeniería de detalle, presupuestos y planificación de obra antes de mover la primera herramienta.',
				body: 'Antes de construir, entendemos tu operación. Visitamos el terreno, levantamos la información necesaria y definimos contigo el alcance, los riesgos y el plan de trabajo.\n\nEntregamos una propuesta clara: ingeniería, presupuesto detallado y carta Gantt, para que tomes decisiones con información real.',
				subServices: ['Visitas y evaluaciones técnicas', 'Ingeniería básica y de detalle', 'Presupuestos y cubicaciones', 'Planificación y carta Gantt', 'Gestión de permisos'],
				capabilities: [],
				sortOrder: 0,
				status: 'published' as const
			},
			{
				slug: 'construccion-y-obras-civiles',
				title: 'Construcción y obras civiles',
				icon: 'building',
				summary: 'Obras civiles, fundaciones, radieres y pavimentos industriales, galpones y edificaciones con supervisión permanente.',
				body: 'Ejecutamos obras civiles para la industria y el comercio, con supervisión directa en terreno y control de calidad en cada etapa.\n\nTrabajamos con procedimientos de trabajo seguro, equipos propios y un equipo que conoce el rubro.',
				subServices: ['Excavaciones y movimientos de tierra', 'Fundaciones y radieres', 'Pavimentos industriales', 'Galpones y edificaciones', 'Cortes y demoliciones de hormigón'],
				capabilities: [],
				sortOrder: 1,
				status: 'published' as const
			},
			{
				slug: 'montaje-y-soluciones-industriales',
				title: 'Montaje y soluciones industriales',
				icon: 'building-factory-2',
				summary: 'Fabricación y montaje de estructuras metálicas, plataformas, barreras de protección y soluciones a medida para plantas.',
				body: 'Fabricamos y montamos estructuras metálicas para plantas industriales, bodegas y centros de distribución.\n\nDesde una plataforma de acceso hasta barreras de protección o soportes de equipos, diseñamos soluciones a medida que cumplen la normativa y se integran a tu operación sin detenerla.',
				subServices: ['Estructuras metálicas', 'Soldadura y fabricación en taller', 'Barreras y protecciones industriales', 'Plataformas y escaleras', 'Montaje de equipos'],
				capabilities: [],
				sortOrder: 2,
				status: 'published' as const
			},
			{
				slug: 'mantencion-y-mejoras',
				title: 'Mantención y mejoras',
				icon: 'tools',
				summary: 'Mantención preventiva y correctiva de infraestructura industrial, con respuesta en terreno 24/7 cuando tu operación lo requiere.',
				body: 'Mantenemos tu infraestructura operativa. Realizamos mantenciones programadas y atendemos emergencias con un equipo disponible las 24 horas.\n\nTrabajamos coordinados con tus turnos para minimizar las detenciones.',
				subServices: ['Mantención preventiva', 'Mantención correctiva', 'Reparación de pavimentos', 'Pintura industrial y demarcación', 'Atención de emergencias 24/7'],
				capabilities: [],
				sortOrder: 3,
				status: 'published' as const
			}
		])
		.returning();
	const svc = (slug: string) => services.find((s) => s.slug === slug)!.id;
	log('services created');

	/* Example projects from the real work photos — drafts until data sheets are completed (plan §6.3). */
	await db.insert(t.projects).values([
		{
			slug: 'barreras-de-proteccion-centro-de-distribucion',
			title: 'Barreras de protección en centro de distribución',
			code: 'OTH-2026-001',
			categoryId: cat('montaje'),
			summary: 'Fabricación e instalación de barreras de acero para proteger estructuras y circulación peatonal dentro de un galpón.',
			scope: 'Fabricación, pintura e instalación de barreras metálicas ancladas a radier.',
			coverMediaId: work1,
			gallery: [{ mediaId: work1 }],
			serviceIds: [svc('montaje-y-soluciones-industriales')],
			featured: true,
			sortOrder: 0,
			status: 'draft' as const
		},
		{
			slug: 'corte-y-reparacion-de-pavimento-industrial',
			title: 'Corte y reparación de pavimento industrial',
			code: 'OTH-2026-002',
			categoryId: cat('obras-civiles'),
			summary: 'Corte de radier con cortadora de piso, excavación y reposición de pavimento dentro de un galpón en operación.',
			coverMediaId: work2,
			gallery: [{ mediaId: work2 }],
			serviceIds: [svc('construccion-y-obras-civiles'), svc('mantencion-y-mejoras')],
			featured: true,
			sortOrder: 1,
			status: 'draft' as const
		},
		{
			slug: 'fabricacion-de-estructuras-metalicas-en-taller',
			title: 'Fabricación de estructuras metálicas en taller',
			code: 'OTH-2026-003',
			categoryId: cat('industria'),
			summary: 'Soldadura y fabricación de piezas metálicas a medida para montaje en terreno.',
			coverMediaId: work3,
			gallery: [{ mediaId: work3 }],
			serviceIds: [svc('montaje-y-soluciones-industriales')],
			featured: true,
			sortOrder: 2,
			status: 'draft' as const
		}
	]);

	/* Equipo directivo (owner request) */
	await db.insert(t.teamMembers).values([
		{
			name: 'Juan Marcelo Escalona Aranda',
			roleTitle: 'Gerente General',
			group: 'directivo' as const,
			bio: 'Ingeniero en Construcción y fundador de Othalan. Lidera la estrategia de la empresa y mantiene el trato directo con cada cliente.',
			photoMediaId: team.juan,
			sortOrder: 0
		},
		{
			name: 'Simón Calaf Aguilera',
			roleTitle: 'Jefe de Operaciones',
			group: 'directivo' as const,
			bio: 'Responsable de la ejecución en terreno: planificación de faenas, equipos, seguridad y cumplimiento de plazos.',
			photoMediaId: team.simon,
			sortOrder: 1
		},
		{
			name: 'Consuelo Escalona',
			roleTitle: 'Jefa de Desarrollo de Negocios',
			group: 'directivo' as const,
			bio: 'Coordina la relación con clientes, cotizaciones y nuevas oportunidades de negocio.',
			photoMediaId: team.consuelo,
			sortOrder: 2
		}
	]);
	log('team created');

	/* Values */
	await db.insert(t.companyValues).values(
		[
			['Seguridad', 'Cada faena comienza con un análisis de riesgos y termina sin accidentes.', 'helmet'],
			['Calidad', 'Trabajo bien hecho, documentado y verificable.', 'award'],
			['Cumplimiento', 'Respetamos plazos, presupuestos y compromisos.', 'clipboard-check'],
			['Criterio técnico', 'Soluciones de ingeniería pensadas para tu operación.', 'ruler-measure'],
			['Compromiso en terreno', 'Estamos presentes donde ocurre el trabajo, 24/7.', 'map-pin'],
			['Trato directo', 'Hablas con quien toma las decisiones.', 'heart-handshake']
		].map(([title, description, icon], i) => ({ title, description, icon, sortOrder: i }))
	);

	/* Stats — values left empty on purpose: hidden on the site until filled in the CMS. */
	await db.insert(t.stats).values(
		[
			['Años de experiencia', '+', 'calendar'],
			['Proyectos ejecutados', '+', 'building'],
			['m² construidos', ' m²', 'ruler-measure'],
			['Trabajadores en terreno', '', 'users']
		].map(([label, suffix, icon], i) => ({ label, suffix, icon, value: null, sortOrder: i }))
	);

	/* FAQ */
	await db.insert(t.faqs).values(
		[
			['¿En qué zonas de Chile trabajan?', 'Ejecutamos proyectos en distintas regiones del país. Cuéntanos dónde está tu proyecto y evaluamos la logística necesaria.', 'General'],
			['¿Cuánto demora una cotización?', 'Respondemos tu solicitud en menos de 24 horas hábiles. Para proyectos que requieren visita técnica, coordinamos la visita y luego enviamos la propuesta.', 'Cotizaciones'],
			['¿Qué información necesito para cotizar?', 'Una descripción del trabajo, ubicación, plazos esperados y, si los tienes, planos, especificaciones técnicas (EETT) o bases de licitación. Puedes adjuntarlos en el formulario de cotización.', 'Cotizaciones'],
			['¿Participan en licitaciones públicas y privadas?', 'Sí. Indícanos el número de licitación en el formulario y revisaremos las bases.', 'Cotizaciones'],
			['¿Atienden emergencias fuera del horario de oficina?', 'Sí, contamos con respuesta en terreno 24/7 para clientes con operaciones continuas. Escríbenos por WhatsApp para una atención más rápida.', 'Servicios'],
			['¿Cómo puedo trabajar con Othalan?', 'Revisa las ofertas vigentes en "Trabaja con nosotros" y postula en línea adjuntando tu CV.', 'Empleo']
		].map(([question, answer, category], i) => ({ question, answer, category, sortOrder: i }))
	);

	/* Static pages */
	await db.insert(t.pages).values(LEGAL_PAGES.map((p) => ({ ...p, status: 'published' as const })));
	log('pages created');

	/* First admin */
	const email = (process.env.SEED_ADMIN_EMAIL || 'admin@othalan.cl').toLowerCase();
	const password = process.env.SEED_ADMIN_PASSWORD || randomBytes(9).toString('base64url') + '7a';
	const existing = await db.select({ id: t.users.id }).from(t.users).where(eq(t.users.email, email));
	if (!existing.length) {
		await db.insert(t.users).values({ email, name: 'Administrador', role: 'admin', passwordHash: await hashPassword(password) });
		log(`admin user: ${email}`);
		if (!process.env.SEED_ADMIN_PASSWORD) {
			await mkdir(path.join(ROOT, '.data'), { recursive: true });
			await writeFile(path.join(ROOT, '.data/admin-credentials.txt'), `${email}
${password}
`);
			log(`temporary password: ${password}  (also saved to .data/admin-credentials.txt — change it after logging in)`);
		}
	}
}
