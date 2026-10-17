import {
	pgTable,
	pgEnum,
	uuid,
	text,
	integer,
	bigint,
	boolean,
	timestamp,
	date,
	jsonb,
	real,
	numeric,
	index
} from 'drizzle-orm/pg-core';

const id = () => uuid().primaryKey().defaultRandom();
const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
	timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date());

export const roleEnum = pgEnum('role', ['admin', 'editor', 'comercial', 'rrhh']);
export const contentStatusEnum = pgEnum('content_status', ['draft', 'published']);
export const teamGroupEnum = pgEnum('team_group', ['directivo', 'jefatura', 'equipo']);
export const certKindEnum = pgEnum('cert_kind', ['certificacion', 'registro', 'afiliacion']);
export const rfqStatusEnum = pgEnum('rfq_status', [
	'nueva',
	'en_revision',
	'visita_tecnica',
	'cotizada',
	'adjudicada',
	'no_adjudicada'
]);
export const inboxStatusEnum = pgEnum('inbox_status', ['nuevo', 'leido', 'respondido', 'archivado']);
export const applicationStatusEnum = pgEnum('application_status', [
	'recibida',
	'preseleccionada',
	'entrevista',
	'descartada',
	'contratada'
]);
export const reportStatusEnum = pgEnum('report_status', ['recibida', 'en_investigacion', 'cerrada']);

/* ───────────────────────────── Auth ───────────────────────────── */

export const users = pgTable('users', {
	id: id(),
	email: text().notNull().unique(),
	name: text().notNull(),
	passwordHash: text().notNull(),
	role: roleEnum().notNull().default('editor'),
	active: boolean().notNull().default(true),
	failedLogins: integer().notNull().default(0),
	lockedUntil: timestamp({ withTimezone: true }),
	lastLoginAt: timestamp({ withTimezone: true }),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const sessions = pgTable(
	'sessions',
	{
		id: text().primaryKey(), // SHA-256 of the session token
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		expiresAt: timestamp({ withTimezone: true }).notNull(),
		lastSeenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.userId)]
);

/* ───────────────────────────── Media ───────────────────────────── */

export const media = pgTable(
	'media',
	{
		id: id(),
		storageKey: text().notNull().unique(),
		filename: text().notNull(),
		mime: text().notNull(),
		bytes: integer().notNull().default(0),
		width: integer(),
		height: integer(),
		alt: text().notNull().default(''),
		caption: text(),
		credit: text(),
		focalX: real().notNull().default(0.5),
		focalY: real().notNull().default(0.5),
		dominantColor: text(),
		folder: text().notNull().default('general'),
		uploadedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
		createdAt: createdAt()
	},
	(t) => [index().on(t.folder), index().on(t.createdAt)]
);

/* ───────────────────────────── Settings ───────────────────────────── */

export const siteSettings = pgTable('site_settings', {
	key: text().primaryKey(),
	value: jsonb().notNull(),
	updatedAt: updatedAt()
});

export const homeSections = pgTable('home_sections', {
	key: text().primaryKey(),
	enabled: boolean().notNull().default(true),
	sortOrder: integer().notNull().default(0),
	data: jsonb().notNull().default({}),
	updatedAt: updatedAt()
});

export const redirects = pgTable('redirects', {
	id: id(),
	fromPath: text().notNull().unique(),
	toPath: text().notNull(),
	statusCode: integer().notNull().default(301),
	createdAt: createdAt()
});

export const offices = pgTable('offices', {
	id: id(),
	name: text().notNull(),
	address: text(),
	comuna: text(),
	region: text(),
	phone: text(),
	email: text(),
	hours: text(),
	mapUrl: text(),
	sortOrder: integer().notNull().default(0),
	status: contentStatusEnum().notNull().default('published'),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

/* ───────────────────────────── Content ───────────────────────────── */

const seo = {
	seoTitle: text(),
	seoDescription: text()
};

export const pages = pgTable('pages', {
	id: id(),
	slug: text().notNull().unique(),
	title: text().notNull(),
	intro: text(),
	body: text(),
	coverMediaId: uuid().references(() => media.id, { onDelete: 'set null' }),
	status: contentStatusEnum().notNull().default('draft'),
	...seo,
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const services = pgTable(
	'services',
	{
		id: id(),
		slug: text().notNull().unique(),
		title: text().notNull(),
		icon: text().notNull().default('tools'),
		summary: text(),
		body: text(),
		subServices: jsonb().$type<string[]>().notNull().default([]),
		capabilities: jsonb().$type<string[]>().notNull().default([]),
		coverMediaId: uuid().references(() => media.id, { onDelete: 'set null' }),
		sortOrder: integer().notNull().default(0),
		status: contentStatusEnum().notNull().default('draft'),
		...seo,
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index().on(t.status, t.sortOrder)]
);

export const projectCategories = pgTable('project_categories', {
	id: id(),
	slug: text().notNull().unique(),
	name: text().notNull(),
	sortOrder: integer().notNull().default(0),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const clients = pgTable('clients', {
	id: id(),
	name: text().notNull(),
	logoMediaId: uuid().references(() => media.id, { onDelete: 'set null' }),
	sector: text(),
	url: text(),
	featured: boolean().notNull().default(true),
	sortOrder: integer().notNull().default(0),
	status: contentStatusEnum().notNull().default('published'),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export type GalleryItem = { mediaId: string; caption?: string };

export const projects = pgTable(
	'projects',
	{
		id: id(),
		slug: text().notNull().unique(),
		title: text().notNull(),
		code: text(),
		categoryId: uuid().references(() => projectCategories.id, { onDelete: 'set null' }),
		clientId: uuid().references(() => clients.id, { onDelete: 'set null' }),
		clientName: text(),
		region: text(),
		comuna: text(),
		year: integer(),
		areaM2: integer(),
		steelTons: numeric({ precision: 12, scale: 1 }),
		durationMonths: numeric({ precision: 6, scale: 1 }),
		amountClp: bigint({ mode: 'number' }),
		showAmount: boolean().notNull().default(false),
		summary: text(),
		scope: text(),
		challenge: text(),
		solution: text(),
		result: text(),
		coverMediaId: uuid().references(() => media.id, { onDelete: 'set null' }),
		gallery: jsonb().$type<GalleryItem[]>().notNull().default([]),
		serviceIds: jsonb().$type<string[]>().notNull().default([]),
		featured: boolean().notNull().default(false),
		sortOrder: integer().notNull().default(0),
		status: contentStatusEnum().notNull().default('draft'),
		publishedAt: timestamp({ withTimezone: true }),
		...seo,
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index().on(t.status, t.publishedAt), index().on(t.categoryId)]
);

export const teamMembers = pgTable(
	'team_members',
	{
		id: id(),
		name: text().notNull(),
		roleTitle: text().notNull(),
		group: teamGroupEnum().notNull().default('directivo'),
		bio: text(),
		photoMediaId: uuid().references(() => media.id, { onDelete: 'set null' }),
		linkedinUrl: text(),
		emailPublic: text(),
		showOnHome: boolean().notNull().default(true),
		sortOrder: integer().notNull().default(0),
		status: contentStatusEnum().notNull().default('published'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index().on(t.status, t.sortOrder)]
);

export const timelineEvents = pgTable('timeline_events', {
	id: id(),
	year: integer().notNull(),
	title: text().notNull(),
	description: text(),
	sortOrder: integer().notNull().default(0),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const companyValues = pgTable('company_values', {
	id: id(),
	title: text().notNull(),
	description: text(),
	icon: text().notNull().default('shield-check'),
	sortOrder: integer().notNull().default(0),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const testimonials = pgTable('testimonials', {
	id: id(),
	clientId: uuid().references(() => clients.id, { onDelete: 'set null' }),
	projectId: uuid().references(() => projects.id, { onDelete: 'set null' }),
	authorName: text().notNull(),
	authorRole: text(),
	company: text(),
	quote: text().notNull(),
	consent: boolean().notNull().default(false),
	sortOrder: integer().notNull().default(0),
	status: contentStatusEnum().notNull().default('draft'),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const certifications = pgTable('certifications', {
	id: id(),
	kind: certKindEnum().notNull().default('certificacion'),
	name: text().notNull(),
	issuer: text(),
	code: text(),
	description: text(),
	issuedAt: date(),
	expiresAt: date(),
	fileMediaId: uuid().references(() => media.id, { onDelete: 'set null' }),
	logoMediaId: uuid().references(() => media.id, { onDelete: 'set null' }),
	sortOrder: integer().notNull().default(0),
	status: contentStatusEnum().notNull().default('published'),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const safetyStats = pgTable('safety_stats', {
	id: id(),
	period: text().notNull(), // e.g. "2026-09" or "Año 2025"
	hhWorked: integer(),
	accidents: integer(),
	daysWithoutAccidents: integer(),
	frequencyRate: numeric({ precision: 8, scale: 2 }),
	accidentRate: numeric({ precision: 8, scale: 2 }),
	notes: text(),
	status: contentStatusEnum().notNull().default('draft'),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const stats = pgTable('stats', {
	id: id(),
	label: text().notNull(),
	value: numeric({ precision: 14, scale: 1 }),
	prefix: text(),
	suffix: text(),
	icon: text(),
	sortOrder: integer().notNull().default(0),
	status: contentStatusEnum().notNull().default('published'),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const equipment = pgTable('equipment', {
	id: id(),
	name: text().notNull(),
	category: text(),
	quantity: integer(),
	capacity: text(),
	description: text(),
	photoMediaId: uuid().references(() => media.id, { onDelete: 'set null' }),
	sortOrder: integer().notNull().default(0),
	status: contentStatusEnum().notNull().default('published'),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const faqs = pgTable('faqs', {
	id: id(),
	question: text().notNull(),
	answer: text().notNull(),
	category: text(),
	sortOrder: integer().notNull().default(0),
	status: contentStatusEnum().notNull().default('published'),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const downloads = pgTable('downloads', {
	id: id(),
	title: text().notNull(),
	description: text(),
	category: text(),
	fileMediaId: uuid().references(() => media.id, { onDelete: 'set null' }),
	sortOrder: integer().notNull().default(0),
	status: contentStatusEnum().notNull().default('published'),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const posts = pgTable(
	'posts',
	{
		id: id(),
		slug: text().notNull().unique(),
		title: text().notNull(),
		excerpt: text(),
		body: text(),
		category: text(),
		coverMediaId: uuid().references(() => media.id, { onDelete: 'set null' }),
		authorName: text(),
		status: contentStatusEnum().notNull().default('draft'),
		publishedAt: timestamp({ withTimezone: true }),
		...seo,
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index().on(t.status, t.publishedAt)]
);

/* ───────────────────────────── Recruiting ───────────────────────────── */

export const jobOpenings = pgTable('job_openings', {
	id: id(),
	slug: text().notNull().unique(),
	title: text().notNull(),
	area: text(),
	location: text(),
	contractType: text(),
	summary: text(),
	body: text(),
	requirements: jsonb().$type<string[]>().notNull().default([]),
	closesAt: date(),
	status: contentStatusEnum().notNull().default('draft'),
	publishedAt: timestamp({ withTimezone: true }),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const jobApplications = pgTable(
	'job_applications',
	{
		id: id(),
		jobId: uuid().references(() => jobOpenings.id, { onDelete: 'set null' }),
		position: text(),
		name: text().notNull(),
		rut: text(),
		email: text().notNull(),
		phone: text(),
		region: text(),
		message: text(),
		cvKey: text(),
		cvFilename: text(),
		status: applicationStatusEnum().notNull().default('recibida'),
		notes: text(),
		consentAt: timestamp({ withTimezone: true }).notNull(),
		ipHash: text(),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index().on(t.status, t.createdAt)]
);

/* ───────────────────────────── Leads & forms ───────────────────────────── */

export const rfqCounters = pgTable('rfq_counters', {
	year: integer().primaryKey(),
	last: integer().notNull().default(0)
});

export const rfqRequests = pgTable(
	'rfq_requests',
	{
		id: id(),
		ticketCode: text().notNull().unique(),
		status: rfqStatusEnum().notNull().default('nueva'),
		assignedTo: uuid().references(() => users.id, { onDelete: 'set null' }),
		// contact
		contactName: text().notNull(),
		company: text(),
		rut: text(),
		position: text(),
		email: text().notNull(),
		phone: text(),
		contactPreference: text(),
		// project
		serviceId: uuid().references(() => services.id, { onDelete: 'set null' }),
		serviceLabel: text(),
		sectors: jsonb().$type<string[]>().notNull().default([]),
		region: text(),
		comuna: text(),
		startDate: date(),
		tenderType: text(),
		tenderNumber: text(),
		// details
		description: text(),
		areaM2: text(),
		steelTons: text(),
		budgetRange: text(),
		// meta
		sourceUrl: text(),
		utm: jsonb().$type<Record<string, string>>(),
		consentAt: timestamp({ withTimezone: true }).notNull(),
		ipHash: text(),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index().on(t.status, t.createdAt)]
);

export const rfqFiles = pgTable('rfq_files', {
	id: id(),
	rfqId: uuid()
		.notNull()
		.references(() => rfqRequests.id, { onDelete: 'cascade' }),
	storageKey: text().notNull(),
	filename: text().notNull(),
	mime: text().notNull(),
	bytes: integer().notNull(),
	createdAt: createdAt()
});

export const rfqNotes = pgTable('rfq_notes', {
	id: id(),
	rfqId: uuid()
		.notNull()
		.references(() => rfqRequests.id, { onDelete: 'cascade' }),
	userId: uuid().references(() => users.id, { onDelete: 'set null' }),
	authorName: text(),
	body: text().notNull(),
	createdAt: createdAt()
});

export const contactMessages = pgTable(
	'contact_messages',
	{
		id: id(),
		name: text().notNull(),
		email: text().notNull(),
		phone: text(),
		company: text(),
		subject: text(),
		message: text().notNull(),
		status: inboxStatusEnum().notNull().default('nuevo'),
		consentAt: timestamp({ withTimezone: true }).notNull(),
		ipHash: text(),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index().on(t.status, t.createdAt)]
);

export const supplierRegistrations = pgTable('supplier_registrations', {
	id: id(),
	companyName: text().notNull(),
	rut: text().notNull(),
	category: text(),
	contactName: text().notNull(),
	email: text().notNull(),
	phone: text(),
	region: text(),
	website: text(),
	message: text(),
	fileKey: text(),
	fileName: text(),
	status: inboxStatusEnum().notNull().default('nuevo'),
	consentAt: timestamp({ withTimezone: true }).notNull(),
	ipHash: text(),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

/** Canal de denuncias (Ley 21.643 "Ley Karin" / Ley 20.393). Admin-only access. */
export const whistleblowerReports = pgTable('whistleblower_reports', {
	id: id(),
	folio: text().notNull().unique(),
	category: text().notNull(),
	description: text().notNull(),
	occurredAt: text(),
	location: text(),
	peopleInvolved: text(),
	anonymous: boolean().notNull().default(true),
	name: text(),
	email: text(),
	phone: text(),
	status: reportStatusEnum().notNull().default('recibida'),
	notes: text(),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

/* ───────────────────────────── System ───────────────────────────── */

export const revisions = pgTable(
	'revisions',
	{
		id: id(),
		entity: text().notNull(),
		entityId: uuid().notNull(),
		snapshot: jsonb().notNull(),
		userId: uuid().references(() => users.id, { onDelete: 'set null' }),
		userName: text(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.entity, t.entityId, t.createdAt)]
);

export const auditLog = pgTable(
	'audit_log',
	{
		id: id(),
		userId: uuid().references(() => users.id, { onDelete: 'set null' }),
		userName: text(),
		action: text().notNull(),
		entity: text().notNull(),
		entityId: text(),
		summary: text(),
		ipHash: text(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.createdAt)]
);

export type User = typeof users.$inferSelect;
export type Role = (typeof roleEnum.enumValues)[number];
export type Media = typeof media.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Service = typeof services.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;

