/** Shared (client + server) shapes for CMS-managed configuration. */

export type SiteSettings = {
	companyName: string;
	legalName: string;
	rut: string;
	giro: string;
	foundedYear: string;
	tagline: string;
	description: string;
	phone: string;
	whatsapp: string;
	whatsappMessage: string;
	email: string;
	address: string;
	comuna: string;
	region: string;
	hours: string;
	fieldSupport: string;
	mapEmbedUrl: string;
	mapLink: string;
	serviceArea: string;
	mutualidad: string;
	social: { linkedin: string; facebook: string; instagram: string; youtube: string };
	notify: { rfq: string; contact: string; jobs: string; suppliers: string; reports: string };
	seo: { defaultTitle: string; defaultDescription: string; ogImageId: string };
	logoId: string;
	announcement: { enabled: boolean; text: string; href: string };
	analytics: { cloudflareToken: string; ga4Id: string };
	rfqResponseTime: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
	companyName: 'Othalan',
	legalName: 'Othalan Ingeniería y Construcción SpA',
	rut: '',
	giro: 'Ingeniería y construcción',
	foundedYear: '',
	tagline: 'Ingeniería y construcción con trato directo.',
	description:
		'Obras civiles, estructuras metálicas, montaje industrial y mantención en Chile, con trato directo con el dueño y respuesta en terreno 24/7.',
	phone: '',
	whatsapp: '',
	whatsappMessage: 'Hola Othalan, quisiera solicitar información sobre un proyecto.',
	email: 'contacto@othalan.cl',
	address: '',
	comuna: '',
	region: 'Metropolitana de Santiago',
	hours: 'Lunes a viernes, 08:30 a 18:00',
	fieldSupport: 'Respuesta en terreno 24/7',
	mapEmbedUrl: '',
	mapLink: '',
	serviceArea: 'Todo Chile',
	mutualidad: '',
	social: { linkedin: '', facebook: '', instagram: '', youtube: '' },
	notify: { rfq: '', contact: '', jobs: '', suppliers: '', reports: '' },
	seo: {
		defaultTitle: 'Othalan Ingeniería y Construcción',
		defaultDescription:
			'Empresa de ingeniería y construcción en Chile: obras civiles, estructuras metálicas, montaje industrial y mantención.',
		ogImageId: ''
	},
	logoId: '',
	announcement: { enabled: false, text: '', href: '' },
	analytics: { cloudflareToken: '', ga4Id: '' },
	rfqResponseTime: 'menos de 24 horas hábiles'
};

export function mergeSettings(value: unknown): SiteSettings {
	const v = (value ?? {}) as Partial<SiteSettings>;
	return {
		...DEFAULT_SETTINGS,
		...v,
		social: { ...DEFAULT_SETTINGS.social, ...(v.social ?? {}) },
		notify: { ...DEFAULT_SETTINGS.notify, ...(v.notify ?? {}) },
		seo: { ...DEFAULT_SETTINGS.seo, ...(v.seo ?? {}) },
		announcement: { ...DEFAULT_SETTINGS.announcement, ...(v.announcement ?? {}) },
		analytics: { ...DEFAULT_SETTINGS.analytics, ...(v.analytics ?? {}) }
	};
}

/* ─────────── Home page sections ─────────── */

export type TextItem = { title: string; text: string };
export type Cta = { label: string; href: string };

export type HomeSectionData = {
	hero: {
		eyebrow: string;
		title: string;
		subtitle: string;
		imageId: string;
		primary: Cta;
		secondary: Cta;
		features: TextItem[];
	};
	clients: { eyebrow: string; title: string };
	services: { eyebrow: string; title: string; lead: string };
	why: { eyebrow: string; title: string; lead: string; imageId: string; points: TextItem[] };
	process: { eyebrow: string; title: string; lead: string; steps: TextItem[] };
	projects: { eyebrow: string; title: string; lead: string };
	team: { eyebrow: string; title: string; lead: string };
	safety: { eyebrow: string; title: string; lead: string };
	testimonials: { eyebrow: string; title: string };
	cta: { title: string; text: string; label: string; href: string };
};

export type HomeSectionKey = keyof HomeSectionData;

export const HOME_SECTION_LABELS: Record<HomeSectionKey, string> = {
	hero: 'Portada (hero)',
	clients: 'Clientes (logos)',
	services: 'Servicios',
	why: '¿Por qué Othalan?',
	process: 'Proceso de trabajo',
	projects: 'Proyectos destacados',
	team: 'Equipo directivo',
	safety: 'Seguridad y certificaciones',
	testimonials: 'Testimonios',
	cta: 'Llamado a la acción final'
};

export const DEFAULT_HOME: HomeSectionData = {
	hero: {
		eyebrow: 'Ingeniería y construcción en Chile',
		title: 'Construimos estructuras que *sostienen* tu operación.',
		subtitle:
			'Obras civiles, estructuras metálicas y montaje industrial con trato directo y respuesta en terreno 24/7.',
		imageId: '',
		primary: { label: 'Solicitar cotización', href: '/cotizacion' },
		secondary: { label: 'Ver proyectos', href: '/proyectos' },
		features: [
			{ title: 'Trato directo', text: 'Hablas con quien dirige la obra, sin intermediarios.' },
			{ title: 'Seguridad primero', text: 'Procedimientos, EPP y supervisión en cada faena.' },
			{ title: 'Respuesta 24/7', text: 'Equipo disponible en terreno cuando tu operación lo necesita.' }
		]
	},
	clients: { eyebrow: 'Confían en nosotros', title: 'Empresas que trabajan con Othalan' },
	services: {
		eyebrow: 'Nuestros servicios',
		title: 'Soluciones de *ingeniería* y construcción',
		lead: 'Acompañamos tu proyecto desde la evaluación técnica hasta la entrega y la mantención.'
	},
	why: {
		eyebrow: '¿Por qué Othalan?',
		title: 'Criterio técnico, *cumplimiento* y trato directo',
		lead: 'Somos un equipo de ingeniería y construcción que trabaja codo a codo con sus clientes.',
		imageId: '',
		points: [
			{ title: 'Trato directo con el dueño', text: 'Decisiones rápidas y comunicación clara durante toda la obra.' },
			{ title: 'Seguridad como estándar', text: 'Planificamos cada faena con análisis de riesgos y EPP completo.' },
			{ title: 'Calidad verificable', text: 'Protocolos, registros y entregas documentadas.' },
			{ title: 'Cumplimiento de plazos', text: 'Planificación realista y seguimiento semanal del avance.' }
		]
	},
	process: {
		eyebrow: 'Cómo trabajamos',
		title: 'Un proceso claro en *4 pasos*',
		lead: '',
		steps: [
			{ title: 'Evaluación técnica', text: 'Visitamos el terreno y entendemos tu necesidad.' },
			{ title: 'Planificación', text: 'Ingeniería, presupuesto detallado y carta Gantt.' },
			{ title: 'Ejecución en terreno', text: 'Obra con supervisión, seguridad y control de calidad.' },
			{ title: 'Entrega y mantención', text: 'Recepción documentada y soporte posterior.' }
		]
	},
	projects: {
		eyebrow: 'Proyectos',
		title: 'Obras que *hablan* por nosotros',
		lead: 'Una selección de trabajos recientes en construcción, industria y montaje.'
	},
	team: {
		eyebrow: 'Equipo directivo',
		title: 'Las personas *detrás* de cada obra',
		lead: 'Un equipo con experiencia en terreno que lidera cada proyecto de forma directa.'
	},
	safety: {
		eyebrow: 'Seguridad y calidad',
		title: 'La seguridad *no se negocia*',
		lead: 'Gestionamos cada faena con estándares de seguridad, salud ocupacional y medio ambiente.'
	},
	testimonials: { eyebrow: 'Testimonios', title: 'Lo que dicen nuestros clientes' },
	cta: {
		title: '¿Tienes un proyecto en mente?',
		text: 'Cuéntanos qué necesitas y te respondemos en menos de 24 horas hábiles.',
		label: 'Solicitar cotización',
		href: '/cotizacion'
	}
};

export const HOME_SECTION_ORDER: HomeSectionKey[] = [
	'hero',
	'clients',
	'services',
	'why',
	'process',
	'projects',
	'team',
	'safety',
	'testimonials',
	'cta'
];

export type HomeSection<K extends HomeSectionKey = HomeSectionKey> = {
	key: K;
	enabled: boolean;
	sortOrder: number;
	data: HomeSectionData[K];
};

export function mergeHomeData<K extends HomeSectionKey>(key: K, data: unknown): HomeSectionData[K] {
	return { ...DEFAULT_HOME[key], ...((data ?? {}) as object) } as HomeSectionData[K];
}

/* ─────────── Status labels (shared by CMS + emails) ─────────── */

export const RFQ_STATUS: Record<string, string> = {
	nueva: 'Nueva',
	en_revision: 'En revisión',
	visita_tecnica: 'Visita técnica',
	cotizada: 'Cotizada',
	adjudicada: 'Adjudicada',
	no_adjudicada: 'No adjudicada'
};

export const INBOX_STATUS: Record<string, string> = {
	nuevo: 'Nuevo',
	leido: 'Leído',
	respondido: 'Respondido',
	archivado: 'Archivado'
};

export const APPLICATION_STATUS: Record<string, string> = {
	recibida: 'Recibida',
	preseleccionada: 'Preseleccionada',
	entrevista: 'Entrevista',
	descartada: 'Descartada',
	contratada: 'Contratada'
};

export const REPORT_STATUS: Record<string, string> = {
	recibida: 'Recibida',
	en_investigacion: 'En investigación',
	cerrada: 'Cerrada'
};

export const AUDIT_ACTIONS: Record<string, string> = {
	create: 'Creó',
	update: 'Editó',
	delete: 'Eliminó',
	publish: 'Publicó',
	login: 'Ingresó',
	logout: 'Salió',
	restore: 'Restauró',
	status: 'Cambió estado',
	export: 'Exportó / descargó',
	upload: 'Subió'
};
