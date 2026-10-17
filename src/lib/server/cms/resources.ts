import type { PgTable } from 'drizzle-orm/pg-core';
import * as t from '../db/schema';
import type { Module } from '../auth';
import type { ColumnDef, FieldDef } from '$lib/cms/types';
import { CONTRACT_TYPES, REGIONES } from '$lib/utils/chile';

export type RelationSpec = { table: PgTable; labelColumn: string; orderColumn?: string };

export type ResourceDef = {
	key: string;
	label: string;
	singular: string;
	icon: string;
	group: string;
	module: Module;
	table: PgTable;
	titleField: string;
	description?: string;
	fields: FieldDef[];
	columns: ColumnDef[];
	/** default ordering column (asc) — 'sortOrder' enables up/down reordering */
	orderBy: string;
	orderDesc?: boolean;
	search: string[];
	relations?: Record<string, RelationSpec>;
	publicPath?: (row: Record<string, unknown>) => string | null;
	defaults?: Record<string, unknown>;
};

const STATUS: FieldDef = { name: 'status', label: 'Estado', type: 'status', width: 'third', section: 'Publicación' };
const SORT: FieldDef = { name: 'sortOrder', label: 'Orden', type: 'number', width: 'third', section: 'Publicación', help: 'Menor número = aparece primero.' };
const SEO: FieldDef[] = [
	{ name: 'seoTitle', label: 'Título SEO', type: 'text', max: 60, section: 'SEO', help: 'Opcional. Máximo 60 caracteres.' },
	{ name: 'seoDescription', label: 'Descripción SEO', type: 'textarea', max: 160, section: 'SEO', help: 'Opcional. Máximo 160 caracteres.' }
];

export const RESOURCES: ResourceDef[] = [
	/* ───────────── Contenido ───────────── */
	{
		key: 'servicios',
		label: 'Servicios',
		singular: 'servicio',
		icon: 'tools',
		group: 'Contenido',
		module: 'content',
		table: t.services,
		titleField: 'title',
		orderBy: 'sortOrder',
		search: ['title', 'summary'],
		publicPath: (r) => `/servicios/${r.slug}`,
		columns: [
			{ key: 'title', label: 'Servicio' },
			{ key: 'slug', label: 'URL', kind: 'mono' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'title', label: 'Título', type: 'text', required: true, max: 60 },
			{ name: 'slug', label: 'URL (slug)', type: 'slug', slugFrom: 'title', required: true, width: 'half' },
			{ name: 'icon', label: 'Ícono', type: 'icon', width: 'half' },
			{ name: 'summary', label: 'Resumen (tarjeta)', type: 'textarea', max: 160, required: true, help: 'Se muestra en las tarjetas. Máx. 160 caracteres.' },
			{ name: 'body', label: 'Descripción completa', type: 'markdown' },
			{ name: 'subServices', label: 'Qué incluye', type: 'list', help: 'Un ítem por línea.' },
			{ name: 'capabilities', label: 'Capacidades técnicas', type: 'list', help: 'Un dato por línea, ej: "Hasta 40 t/mes en taller".' },
			{ name: 'coverMediaId', label: 'Imagen de portada', type: 'image' },
			STATUS,
			SORT,
			...SEO
		],
		defaults: { status: 'draft', icon: 'tools', sortOrder: 0 }
	},
	{
		key: 'proyectos',
		label: 'Proyectos',
		singular: 'proyecto',
		icon: 'building',
		group: 'Contenido',
		module: 'content',
		table: t.projects,
		titleField: 'title',
		orderBy: 'sortOrder',
		search: ['title', 'code', 'clientName', 'comuna'],
		publicPath: (r) => `/proyectos/${r.slug}`,
		relations: {
			categoryId: { table: t.projectCategories, labelColumn: 'name', orderColumn: 'sortOrder' },
			clientId: { table: t.clients, labelColumn: 'name', orderColumn: 'name' },
			serviceIds: { table: t.services, labelColumn: 'title', orderColumn: 'sortOrder' }
		},
		columns: [
			{ key: 'coverMediaId', label: '', kind: 'image' },
			{ key: 'title', label: 'Proyecto' },
			{ key: 'code', label: 'Código', kind: 'mono' },
			{ key: 'year', label: 'Año', kind: 'mono' },
			{ key: 'featured', label: 'Destacado', kind: 'bool' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'title', label: 'Nombre del proyecto', type: 'text', required: true, max: 60, section: 'General' },
			{ name: 'slug', label: 'URL (slug)', type: 'slug', slugFrom: 'title', required: true, width: 'half', section: 'General' },
			{ name: 'code', label: 'Código interno', type: 'text', width: 'half', placeholder: 'OTH-2026-014', section: 'General' },
			{ name: 'categoryId', label: 'Categoría', type: 'relation', width: 'half', section: 'General' },
			{ name: 'serviceIds', label: 'Servicios relacionados', type: 'multirelation', section: 'General' },
			{ name: 'summary', label: 'Resumen', type: 'textarea', max: 160, required: true, section: 'General' },
			{ name: 'clientId', label: 'Mandante (de la lista de clientes)', type: 'relation', width: 'half', section: 'Ficha técnica' },
			{ name: 'clientName', label: 'Mandante (texto libre)', type: 'text', width: 'half', section: 'Ficha técnica', help: 'Úsalo si el cliente no está en la lista. Déjalo vacío si el mandante es confidencial.' },
			{ name: 'region', label: 'Región', type: 'select', options: REGIONES.map((r) => ({ value: r, label: r })), width: 'half', section: 'Ficha técnica' },
			{ name: 'comuna', label: 'Comuna', type: 'text', width: 'half', section: 'Ficha técnica' },
			{ name: 'year', label: 'Año', type: 'number', width: 'third', section: 'Ficha técnica' },
			{ name: 'areaM2', label: 'Superficie', type: 'number', suffix: 'm²', width: 'third', section: 'Ficha técnica' },
			{ name: 'steelTons', label: 'Acero', type: 'decimal', suffix: 't', width: 'third', section: 'Ficha técnica' },
			{ name: 'durationMonths', label: 'Plazo', type: 'decimal', suffix: 'meses', width: 'third', section: 'Ficha técnica' },
			{ name: 'amountClp', label: 'Monto (CLP)', type: 'number', width: 'third', section: 'Ficha técnica', private: true },
			{ name: 'showAmount', label: 'Mostrar monto en el sitio', type: 'boolean', width: 'third', section: 'Ficha técnica' },
			{ name: 'scope', label: 'Alcance', type: 'textarea', section: 'Narrativa' },
			{ name: 'challenge', label: 'El desafío', type: 'markdown', section: 'Narrativa' },
			{ name: 'solution', label: 'La solución', type: 'markdown', section: 'Narrativa' },
			{ name: 'result', label: 'El resultado', type: 'markdown', section: 'Narrativa' },
			{ name: 'coverMediaId', label: 'Foto de portada', type: 'image', section: 'Fotos', required: true },
			{ name: 'gallery', label: 'Galería', type: 'gallery', section: 'Fotos', help: 'Revisa que todas las personas usen EPP completo antes de publicar.' },
			{ name: 'featured', label: 'Destacar en Inicio', type: 'boolean', width: 'third', section: 'Publicación' },
			STATUS,
			{ name: 'publishedAt', label: 'Publicar desde', type: 'datetime', width: 'third', section: 'Publicación', help: 'Opcional: programa la publicación para una fecha futura.' },
			SORT,
			...SEO
		],
		defaults: { status: 'draft', sortOrder: 0, gallery: [], serviceIds: [] }
	},
	{
		key: 'categorias',
		label: 'Categorías de proyecto',
		singular: 'categoría',
		icon: 'layout-grid',
		group: 'Contenido',
		module: 'content',
		table: t.projectCategories,
		titleField: 'name',
		orderBy: 'sortOrder',
		search: ['name'],
		columns: [
			{ key: 'name', label: 'Nombre' },
			{ key: 'slug', label: 'URL', kind: 'mono' }
		],
		fields: [
			{ name: 'name', label: 'Nombre', type: 'text', required: true, max: 40 },
			{ name: 'slug', label: 'URL (slug)', type: 'slug', slugFrom: 'name', required: true },
			{ name: 'sortOrder', label: 'Orden', type: 'number' }
		],
		defaults: { sortOrder: 0 }
	},
	{
		key: 'paginas',
		label: 'Páginas',
		singular: 'página',
		icon: 'file-text',
		group: 'Contenido',
		module: 'content',
		table: t.pages,
		titleField: 'title',
		orderBy: 'slug',
		search: ['title', 'slug'],
		description: 'Textos de Nosotros, Seguridad y calidad, Proveedores, Canal de denuncias y páginas legales. Usa *asteriscos* en el título para destacar una palabra.',
		publicPath: (r) => `/${r.slug}`,
		columns: [
			{ key: 'title', label: 'Título' },
			{ key: 'slug', label: 'URL', kind: 'mono' },
			{ key: 'status', label: 'Estado', kind: 'status' },
			{ key: 'updatedAt', label: 'Actualizado', kind: 'date' }
		],
		fields: [
			{ name: 'title', label: 'Título', type: 'text', required: true, help: 'Encierra una palabra entre *asteriscos* para destacarla.' },
			{ name: 'slug', label: 'URL (slug)', type: 'slug', slugFrom: 'title', required: true, help: 'Las páginas del sistema (nosotros, seguridad-y-calidad, proveedores, canal-de-denuncias, politica-de-privacidad, terminos-y-condiciones, politica-de-cookies) no deben cambiar de URL.' },
			{ name: 'intro', label: 'Bajada / introducción', type: 'textarea', max: 400 },
			{ name: 'body', label: 'Contenido', type: 'markdown' },
			{ name: 'coverMediaId', label: 'Imagen de cabecera', type: 'image' },
			STATUS,
			...SEO
		],
		defaults: { status: 'draft' }
	},
	{
		key: 'noticias',
		label: 'Noticias',
		singular: 'noticia',
		icon: 'news',
		group: 'Contenido',
		module: 'content',
		table: t.posts,
		titleField: 'title',
		orderBy: 'createdAt',
		orderDesc: true,
		search: ['title', 'excerpt'],
		publicPath: (r) => `/noticias/${r.slug}`,
		columns: [
			{ key: 'title', label: 'Título' },
			{ key: 'category', label: 'Categoría', kind: 'badge' },
			{ key: 'publishedAt', label: 'Publicación', kind: 'date' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'title', label: 'Título', type: 'text', required: true, max: 90 },
			{ name: 'slug', label: 'URL (slug)', type: 'slug', slugFrom: 'title', required: true, width: 'half' },
			{ name: 'category', label: 'Categoría', type: 'text', width: 'half', placeholder: 'Proyectos, Seguridad, Empresa…' },
			{ name: 'excerpt', label: 'Bajada', type: 'textarea', max: 200 },
			{ name: 'body', label: 'Contenido', type: 'markdown', required: true },
			{ name: 'coverMediaId', label: 'Imagen de portada', type: 'image' },
			{ name: 'authorName', label: 'Autor', type: 'text', width: 'half' },
			STATUS,
			{ name: 'publishedAt', label: 'Fecha de publicación', type: 'datetime', width: 'third', section: 'Publicación', help: 'Si es futura, la noticia se publica automáticamente ese día.' },
			...SEO
		],
		defaults: { status: 'draft' }
	},
	{
		key: 'faq',
		label: 'Preguntas frecuentes',
		singular: 'pregunta',
		icon: 'help-circle',
		group: 'Contenido',
		module: 'content',
		table: t.faqs,
		titleField: 'question',
		orderBy: 'sortOrder',
		search: ['question', 'answer', 'category'],
		columns: [
			{ key: 'question', label: 'Pregunta' },
			{ key: 'category', label: 'Categoría', kind: 'badge' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'question', label: 'Pregunta', type: 'text', required: true },
			{ name: 'answer', label: 'Respuesta', type: 'textarea', required: true },
			{ name: 'category', label: 'Categoría', type: 'text', placeholder: 'General, Cotizaciones, Servicios, Empleo' },
			STATUS,
			SORT
		],
		defaults: { status: 'published', sortOrder: 0 }
	},
	{
		key: 'descargas',
		label: 'Descargas',
		singular: 'documento',
		icon: 'download',
		group: 'Contenido',
		module: 'content',
		table: t.downloads,
		titleField: 'title',
		orderBy: 'sortOrder',
		search: ['title', 'category'],
		columns: [
			{ key: 'title', label: 'Documento' },
			{ key: 'category', label: 'Categoría', kind: 'badge' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'title', label: 'Título', type: 'text', required: true },
			{ name: 'description', label: 'Descripción', type: 'textarea', max: 200 },
			{ name: 'category', label: 'Categoría', type: 'text', placeholder: 'Brochure, Ficha empresa…' },
			{ name: 'fileMediaId', label: 'Archivo (PDF)', type: 'file', required: true },
			STATUS,
			SORT
		],
		defaults: { status: 'published', sortOrder: 0 }
	},

	/* ───────────── Empresa ───────────── */
	{
		key: 'equipo',
		label: 'Equipo',
		singular: 'persona',
		icon: 'users',
		group: 'Empresa',
		module: 'content',
		table: t.teamMembers,
		titleField: 'name',
		orderBy: 'sortOrder',
		search: ['name', 'roleTitle'],
		description: 'Equipo directivo y jefaturas. Las fotos se muestran en formato 4:5; usa el punto focal de la biblioteca de medios para centrar el rostro.',
		columns: [
			{ key: 'photoMediaId', label: '', kind: 'image' },
			{ key: 'name', label: 'Nombre' },
			{ key: 'roleTitle', label: 'Cargo' },
			{ key: 'group', label: 'Grupo', kind: 'badge' },
			{ key: 'showOnHome', label: 'En Inicio', kind: 'bool' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'name', label: 'Nombre completo', type: 'text', required: true },
			{ name: 'roleTitle', label: 'Cargo', type: 'text', required: true, width: 'half' },
			{
				name: 'group',
				label: 'Grupo',
				type: 'select',
				width: 'half',
				options: [
					{ value: 'directivo', label: 'Equipo directivo' },
					{ value: 'jefatura', label: 'Jefatura' },
					{ value: 'equipo', label: 'Equipo' }
				]
			},
			{ name: 'bio', label: 'Biografía', type: 'textarea', max: 1200, help: 'Las primeras ~160 letras se ven en la tarjeta; el resto en "Ver perfil".' },
			{ name: 'photoMediaId', label: 'Foto (4:5)', type: 'image', required: true },
			{ name: 'linkedinUrl', label: 'LinkedIn', type: 'url', width: 'half' },
			{ name: 'emailPublic', label: 'Correo público', type: 'email', width: 'half' },
			{ name: 'showOnHome', label: 'Mostrar en Inicio', type: 'boolean', width: 'third', section: 'Publicación' },
			STATUS,
			SORT
		],
		defaults: { status: 'published', group: 'directivo', showOnHome: true, sortOrder: 0 }
	},
	{
		key: 'valores',
		label: 'Valores',
		singular: 'valor',
		icon: 'heart-handshake',
		group: 'Empresa',
		module: 'content',
		table: t.companyValues,
		titleField: 'title',
		orderBy: 'sortOrder',
		search: ['title'],
		columns: [
			{ key: 'title', label: 'Valor' },
			{ key: 'description', label: 'Descripción' }
		],
		fields: [
			{ name: 'title', label: 'Título', type: 'text', required: true, max: 40 },
			{ name: 'description', label: 'Descripción', type: 'textarea', max: 200 },
			{ name: 'icon', label: 'Ícono', type: 'icon' },
			{ name: 'sortOrder', label: 'Orden', type: 'number' }
		],
		defaults: { icon: 'shield-check', sortOrder: 0 }
	},
	{
		key: 'historia',
		label: 'Historia (hitos)',
		singular: 'hito',
		icon: 'history',
		group: 'Empresa',
		module: 'content',
		table: t.timelineEvents,
		titleField: 'title',
		orderBy: 'year',
		search: ['title'],
		columns: [
			{ key: 'year', label: 'Año', kind: 'mono' },
			{ key: 'title', label: 'Hito' }
		],
		fields: [
			{ name: 'year', label: 'Año', type: 'number', required: true, width: 'third' },
			{ name: 'title', label: 'Título', type: 'text', required: true },
			{ name: 'description', label: 'Descripción', type: 'textarea' }
		],
		defaults: { sortOrder: 0 }
	},
	{
		key: 'estadisticas',
		label: 'Estadísticas',
		singular: 'estadística',
		icon: 'chart-bar',
		group: 'Empresa',
		module: 'content',
		table: t.stats,
		titleField: 'label',
		orderBy: 'sortOrder',
		search: ['label'],
		description: 'Cifras de la empresa. Las que tengan valor vacío o 0 no se muestran en el sitio.',
		columns: [
			{ key: 'label', label: 'Indicador' },
			{ key: 'value', label: 'Valor', kind: 'mono' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'label', label: 'Etiqueta', type: 'text', required: true, max: 40 },
			{ name: 'value', label: 'Valor', type: 'decimal', width: 'third' },
			{ name: 'prefix', label: 'Prefijo', type: 'text', width: 'third', placeholder: 'Ej: +' },
			{ name: 'suffix', label: 'Sufijo', type: 'text', width: 'third', placeholder: 'Ej: + · m² · t' },
			{ name: 'icon', label: 'Ícono', type: 'icon' },
			STATUS,
			SORT
		],
		defaults: { status: 'published', sortOrder: 0 }
	},
	{
		key: 'maquinaria',
		label: 'Maquinaria y equipos',
		singular: 'equipo',
		icon: 'forklift',
		group: 'Empresa',
		module: 'content',
		table: t.equipment,
		titleField: 'name',
		orderBy: 'sortOrder',
		search: ['name', 'category'],
		columns: [
			{ key: 'photoMediaId', label: '', kind: 'image' },
			{ key: 'name', label: 'Equipo' },
			{ key: 'category', label: 'Categoría', kind: 'badge' },
			{ key: 'quantity', label: 'Cant.', kind: 'mono' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'name', label: 'Nombre', type: 'text', required: true },
			{ name: 'category', label: 'Categoría', type: 'text', width: 'half', placeholder: 'Izaje, Corte, Soldadura…' },
			{ name: 'quantity', label: 'Cantidad', type: 'number', width: 'third' },
			{ name: 'capacity', label: 'Capacidad', type: 'text', width: 'half', placeholder: 'Ej: 3 t' },
			{ name: 'description', label: 'Descripción', type: 'textarea' },
			{ name: 'photoMediaId', label: 'Foto', type: 'image' },
			STATUS,
			SORT
		],
		defaults: { status: 'published', sortOrder: 0 }
	},
	{
		key: 'oficinas',
		label: 'Oficinas y talleres',
		singular: 'oficina',
		icon: 'map-pin',
		group: 'Empresa',
		module: 'settings',
		table: t.offices,
		titleField: 'name',
		orderBy: 'sortOrder',
		search: ['name', 'comuna'],
		columns: [
			{ key: 'name', label: 'Nombre' },
			{ key: 'comuna', label: 'Comuna' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Oficina central / Taller' },
			{ name: 'address', label: 'Dirección', type: 'text' },
			{ name: 'comuna', label: 'Comuna', type: 'text', width: 'half' },
			{ name: 'region', label: 'Región', type: 'select', options: REGIONES.map((r) => ({ value: r, label: r })), width: 'half' },
			{ name: 'phone', label: 'Teléfono', type: 'text', width: 'half' },
			{ name: 'email', label: 'Correo', type: 'email', width: 'half' },
			{ name: 'hours', label: 'Horario', type: 'text' },
			{ name: 'mapUrl', label: 'Enlace a Google Maps', type: 'url' },
			STATUS,
			SORT
		],
		defaults: { status: 'published', sortOrder: 0 }
	},

	/* ───────────── Confianza ───────────── */
	{
		key: 'clientes',
		label: 'Clientes',
		singular: 'cliente',
		icon: 'building-community',
		group: 'Confianza',
		module: 'content',
		table: t.clients,
		titleField: 'name',
		orderBy: 'sortOrder',
		search: ['name', 'sector'],
		description: 'Publica logos solo con autorización del cliente.',
		columns: [
			{ key: 'logoMediaId', label: '', kind: 'image' },
			{ key: 'name', label: 'Cliente' },
			{ key: 'sector', label: 'Sector', kind: 'badge' },
			{ key: 'featured', label: 'En Inicio', kind: 'bool' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'name', label: 'Nombre', type: 'text', required: true },
			{ name: 'sector', label: 'Sector', type: 'text', width: 'half', placeholder: 'Minería, Retail, Logística…' },
			{ name: 'url', label: 'Sitio web', type: 'url', width: 'half' },
			{ name: 'logoMediaId', label: 'Logo (SVG o PNG transparente)', type: 'image' },
			{ name: 'featured', label: 'Mostrar en Inicio', type: 'boolean', width: 'third', section: 'Publicación' },
			STATUS,
			SORT
		],
		defaults: { status: 'published', featured: true, sortOrder: 0 }
	},
	{
		key: 'testimonios',
		label: 'Testimonios',
		singular: 'testimonio',
		icon: 'quote',
		group: 'Confianza',
		module: 'content',
		table: t.testimonials,
		titleField: 'authorName',
		orderBy: 'sortOrder',
		search: ['authorName', 'company', 'quote'],
		description: 'Solo testimonios reales, con autorización escrita. Sin la casilla de autorización marcada, el testimonio no se muestra.',
		relations: {
			clientId: { table: t.clients, labelColumn: 'name', orderColumn: 'name' },
			projectId: { table: t.projects, labelColumn: 'title', orderColumn: 'title' }
		},
		columns: [
			{ key: 'authorName', label: 'Autor' },
			{ key: 'company', label: 'Empresa' },
			{ key: 'consent', label: 'Autorizado', kind: 'bool' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'quote', label: 'Testimonio', type: 'textarea', required: true, max: 500 },
			{ name: 'authorName', label: 'Nombre', type: 'text', required: true, width: 'half' },
			{ name: 'authorRole', label: 'Cargo', type: 'text', width: 'half' },
			{ name: 'company', label: 'Empresa', type: 'text', width: 'half' },
			{ name: 'clientId', label: 'Cliente (logo)', type: 'relation', width: 'half' },
			{ name: 'projectId', label: 'Proyecto relacionado', type: 'relation' },
			{ name: 'consent', label: 'Cuento con autorización escrita para publicarlo', type: 'boolean', required: true, section: 'Publicación' },
			STATUS,
			SORT
		],
		defaults: { status: 'draft', consent: false, sortOrder: 0 }
	},
	{
		key: 'certificaciones',
		label: 'Certificaciones y registros',
		singular: 'certificación',
		icon: 'certificate',
		group: 'Confianza',
		module: 'content',
		table: t.certifications,
		titleField: 'name',
		orderBy: 'sortOrder',
		search: ['name', 'issuer', 'code'],
		description: 'ISO, registros de contratista (MOP, RENAC, ChileProveedores, SICEP, REPRO…) y afiliación a mutualidad.',
		columns: [
			{ key: 'name', label: 'Nombre' },
			{ key: 'kind', label: 'Tipo', kind: 'badge' },
			{ key: 'expiresAt', label: 'Vence', kind: 'date' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'ISO 45001:2018' },
			{
				name: 'kind',
				label: 'Tipo',
				type: 'select',
				width: 'half',
				options: [
					{ value: 'certificacion', label: 'Certificación' },
					{ value: 'registro', label: 'Registro de contratista' },
					{ value: 'afiliacion', label: 'Afiliación' }
				]
			},
			{ name: 'issuer', label: 'Entidad emisora', type: 'text', width: 'half' },
			{ name: 'code', label: 'N.º de certificado / registro', type: 'text', width: 'half' },
			{ name: 'description', label: 'Descripción', type: 'textarea', max: 300 },
			{ name: 'issuedAt', label: 'Fecha de emisión', type: 'date', width: 'half' },
			{ name: 'expiresAt', label: 'Fecha de vencimiento', type: 'date', width: 'half', help: 'Recibirás un aviso 30 días antes del vencimiento.' },
			{ name: 'fileMediaId', label: 'Certificado (PDF)', type: 'file' },
			{ name: 'logoMediaId', label: 'Logo', type: 'image' },
			STATUS,
			SORT
		],
		defaults: { status: 'published', kind: 'certificacion', sortOrder: 0 }
	},
	{
		key: 'seguridad',
		label: 'Indicadores de seguridad',
		singular: 'registro de indicadores',
		icon: 'helmet',
		group: 'Confianza',
		module: 'content',
		table: t.safetyStats,
		titleField: 'period',
		orderBy: 'updatedAt',
		orderDesc: true,
		search: ['period'],
		description: 'Se muestra el registro publicado más reciente. Actualízalo mensualmente.',
		columns: [
			{ key: 'period', label: 'Período', kind: 'mono' },
			{ key: 'daysWithoutAccidents', label: 'Días sin accidentes', kind: 'mono' },
			{ key: 'accidentRate', label: 'Tasa', kind: 'mono' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'period', label: 'Período', type: 'text', required: true, placeholder: 'Septiembre 2026 / Año 2025', width: 'half' },
			{ name: 'daysWithoutAccidents', label: 'Días sin accidentes', type: 'number', width: 'half' },
			{ name: 'hhWorked', label: 'Horas hombre trabajadas', type: 'number', width: 'half' },
			{ name: 'accidents', label: 'Accidentes con tiempo perdido', type: 'number', width: 'half' },
			{ name: 'accidentRate', label: 'Tasa de accidentabilidad', type: 'decimal', suffix: '%', width: 'half' },
			{ name: 'frequencyRate', label: 'Tasa de frecuencia', type: 'decimal', width: 'half' },
			{ name: 'notes', label: 'Nota', type: 'textarea', max: 300, help: 'Ej: "Fuente: informe mutualidad".' },
			STATUS
		],
		defaults: { status: 'draft' }
	},

	/* ───────────── Empleo ───────────── */
	{
		key: 'empleos',
		label: 'Ofertas de empleo',
		singular: 'oferta',
		icon: 'briefcase',
		group: 'Empleo',
		module: 'jobs',
		table: t.jobOpenings,
		titleField: 'title',
		orderBy: 'createdAt',
		orderDesc: true,
		search: ['title', 'location', 'area'],
		publicPath: (r) => `/trabaja-con-nosotros/${r.slug}`,
		columns: [
			{ key: 'title', label: 'Cargo' },
			{ key: 'location', label: 'Ubicación' },
			{ key: 'closesAt', label: 'Cierre', kind: 'date' },
			{ key: 'status', label: 'Estado', kind: 'status' }
		],
		fields: [
			{ name: 'title', label: 'Cargo', type: 'text', required: true },
			{ name: 'slug', label: 'URL (slug)', type: 'slug', slugFrom: 'title', required: true, width: 'half' },
			{ name: 'area', label: 'Área', type: 'text', width: 'half', placeholder: 'Operaciones, Taller…' },
			{ name: 'location', label: 'Ubicación', type: 'text', width: 'half', placeholder: 'Santiago, RM' },
			{ name: 'contractType', label: 'Tipo de contrato', type: 'select', options: CONTRACT_TYPES.map((c) => ({ value: c, label: c })), width: 'half' },
			{ name: 'summary', label: 'Resumen', type: 'textarea', max: 200 },
			{ name: 'body', label: 'Descripción del cargo', type: 'markdown' },
			{ name: 'requirements', label: 'Requisitos', type: 'list', help: 'Uno por línea.' },
			{ name: 'closesAt', label: 'Fecha de cierre', type: 'date', width: 'third', section: 'Publicación' },
			STATUS,
			{ name: 'publishedAt', label: 'Publicar desde', type: 'datetime', width: 'third', section: 'Publicación' }
		],
		defaults: { status: 'draft', requirements: [] }
	},

	/* ───────────── Sitio ───────────── */
	{
		key: 'redirecciones',
		label: 'Redirecciones',
		singular: 'redirección',
		icon: 'route',
		group: 'Sitio',
		module: 'settings',
		table: t.redirects,
		titleField: 'fromPath',
		orderBy: 'fromPath',
		search: ['fromPath', 'toPath'],
		description: 'Redirecciones 301 desde URLs antiguas (por ejemplo, del sitio WordPress anterior).',
		columns: [
			{ key: 'fromPath', label: 'Desde', kind: 'mono' },
			{ key: 'toPath', label: 'Hacia', kind: 'mono' },
			{ key: 'statusCode', label: 'Código', kind: 'mono' }
		],
		fields: [
			{ name: 'fromPath', label: 'Ruta antigua', type: 'text', required: true, placeholder: '/servicios-2/' },
			{ name: 'toPath', label: 'Ruta nueva', type: 'text', required: true, placeholder: '/servicios' },
			{
				name: 'statusCode',
				label: 'Tipo',
				type: 'select',
				options: [
					{ value: '301', label: '301 · Permanente' },
					{ value: '302', label: '302 · Temporal' }
				]
			}
		],
		defaults: { statusCode: 301 }
	}
];

export const RESOURCE_MAP = new Map(RESOURCES.map((r) => [r.key, r]));
export const RESOURCE_GROUPS = [...new Set(RESOURCES.map((r) => r.group))];
