/* eslint-disable @typescript-eslint/no-explicit-any */
import { and, asc, count, desc, eq, ilike, inArray, or, type SQL } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';
import type { DB } from '../db/client';
import { media, revisions } from '../db/schema';
import { audit } from '../audit';
import { can, type SessionUser } from '../auth';
import type { ResourceDef } from './resources';
import type { FieldDef, MediaInfo, Option, ResourceMeta } from '$lib/cms/types';
import { slugify } from '$lib/utils/slug';
import { parseLocaleNumber } from '$lib/utils/format';

const PAGE_SIZE = 25;

/** "2026-10-17T09:30" in America/Santiago (DST-aware: UTC-3 / UTC-4) → Date. */
export function santiagoLocalToDate(local: string): Date {
	const guess = new Date(`${local.slice(0, 16)}:00Z`);
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat('en-US', {
			timeZone: 'America/Santiago',
			hourCycle: 'h23',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
			.formatToParts(guess)
			.map((p) => [p.type, p.value])
	);
	const asZone = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
	return new Date(guess.getTime() - (asZone - guess.getTime()));
}

const cols = (def: ResourceDef) => getTableColumns(def.table) as Record<string, any>;

export function toMeta(def: ResourceDef, user: SessionUser): ResourceMeta {
	return {
		key: def.key,
		label: def.label,
		singular: def.singular,
		icon: def.icon,
		group: def.group,
		titleField: def.titleField,
		sortable: def.orderBy === 'sortOrder',
		hasStatus: 'status' in cols(def),
		description: def.description,
		fields: def.fields,
		columns: def.columns,
		publicPath: null,
		canWrite: can(user, def.module, 'write')
	};
}

export async function listRows(db: DB, def: ResourceDef, opts: { q?: string; status?: string; page?: number }) {
	const c = cols(def);
	const conds: SQL[] = [];
	if (opts.q) {
		const like = `%${opts.q.replace(/[%_]/g, '')}%`;
		const searchConds = def.search.filter((s) => c[s]).map((s) => ilike(c[s], like));
		if (searchConds.length) conds.push(or(...searchConds)!);
	}
	if (opts.status && c.status) conds.push(eq(c.status, opts.status));
	const where = conds.length ? and(...conds) : undefined;
	const order = def.orderDesc ? desc(c[def.orderBy]) : asc(c[def.orderBy]);
	const page = Math.max(1, opts.page ?? 1);
	const [rows, [{ total }]] = await Promise.all([
		(db as any)
			.select()
			.from(def.table)
			.where(where)
			.orderBy(order, desc(c.createdAt ?? c.id))
			.limit(PAGE_SIZE)
			.offset((page - 1) * PAGE_SIZE),
		(db as any).select({ total: count() }).from(def.table).where(where)
	]);
	return { rows: rows as Record<string, unknown>[], total: Number(total), page, pages: Math.max(1, Math.ceil(Number(total) / PAGE_SIZE)) };
}

export async function getRow(db: DB, def: ResourceDef, id: string) {
	const c = cols(def);
	const [row] = await (db as any).select().from(def.table).where(eq(c.id, id)).limit(1);
	return (row as Record<string, unknown>) ?? null;
}

/** Options for relation / multirelation fields. */
export async function relationOptions(db: DB, def: ResourceDef): Promise<Record<string, Option[]>> {
	const out: Record<string, Option[]> = {};
	for (const [field, spec] of Object.entries(def.relations ?? {})) {
		const rc = getTableColumns(spec.table) as Record<string, any>;
		const rows = await (db as any)
			.select({ id: rc.id, label: rc[spec.labelColumn] })
			.from(spec.table)
			.orderBy(asc(rc[spec.orderColumn ?? spec.labelColumn]));
		out[field] = rows.map((r: { id: string; label: string }) => ({ value: r.id, label: r.label }));
	}
	return out;
}

/** Media referenced by image/file/gallery fields of rows, keyed by id (for previews). */
export async function mediaFor(db: DB, def: ResourceDef, rows: Record<string, unknown>[]): Promise<Record<string, MediaInfo>> {
	const ids = new Set<string>();
	for (const row of rows) {
		for (const f of def.fields) {
			const v = row[f.name];
			if ((f.type === 'image' || f.type === 'file') && typeof v === 'string' && v) ids.add(v);
			if (f.type === 'gallery' && Array.isArray(v)) v.forEach((g: { mediaId: string }) => ids.add(g.mediaId));
		}
		for (const col of def.columns) if (col.kind === 'image' && typeof row[col.key] === 'string' && row[col.key]) ids.add(row[col.key] as string);
	}
	if (!ids.size) return {};
	const list = await db
		.select({
			id: media.id,
			storageKey: media.storageKey,
			mime: media.mime,
			filename: media.filename,
			alt: media.alt,
			width: media.width,
			height: media.height,
			bytes: media.bytes,
			dominantColor: media.dominantColor
		})
		.from(media)
		.where(inArray(media.id, [...ids]));
	return Object.fromEntries(list.map((m) => [m.id, m]));
}

/* ─────────── Form parsing ─────────── */

export function parseForm(def: ResourceDef, form: FormData) {
	const c = cols(def);
	const values: Record<string, unknown> = {};
	const errors: Record<string, string> = {};

	for (const f of def.fields) {
		const raw = form.get(f.name);
		const s = typeof raw === 'string' ? raw.trim() : '';
		const col = c[f.name];
		let v: unknown;
		switch (f.type) {
			case 'boolean':
				v = raw === 'on' || raw === 'true';
				break;
			case 'number': {
				if (!s) v = null;
				else {
					const n = parseLocaleNumber(s);
					if (n === null || !Number.isFinite(n)) errors[f.name] = 'Debe ser un número.';
					v = n === null ? null : Math.round(n);
				}
				break;
			}
			case 'decimal': {
				if (!s) v = null;
				else {
					const n = parseLocaleNumber(s);
					if (n === null) errors[f.name] = 'Debe ser un número (usa coma para decimales).';
					v = n === null ? null : String(n);
				}
				break;
			}
			case 'list':
				v = s
					.split(/\r?\n/)
					.map((x) => x.trim())
					.filter(Boolean);
				break;
			case 'multirelation':
				v = form.getAll(f.name).map(String).filter(Boolean);
				break;
			case 'gallery': {
				try {
					const parsed = JSON.parse(s || '[]');
					v = Array.isArray(parsed)
						? parsed
								.filter((g) => typeof g?.mediaId === 'string')
								.map((g) => ({ mediaId: g.mediaId, ...(g.caption ? { caption: String(g.caption).slice(0, 200) } : {}) }))
						: [];
				} catch {
					v = [];
				}
				break;
			}
			case 'datetime':
				v = s ? santiagoLocalToDate(s) : null;
				if (v instanceof Date && isNaN(v.getTime())) errors[f.name] = 'Fecha no válida.';
				break;
			case 'date':
				v = s || null;
				if (s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) errors[f.name] = 'Fecha no válida.';
				break;
			case 'slug': {
				const source = s || String(form.get(f.slugFrom ?? '') ?? '');
				v = slugify(source);
				break;
			}
			case 'email':
				v = s || null;
				if (s && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) errors[f.name] = 'Correo no válido.';
				break;
			case 'url':
				v = s || null;
				if (s && !/^https?:\/\//i.test(s)) errors[f.name] = 'Debe comenzar con https://';
				break;
			case 'select':
			case 'relation':
			case 'image':
			case 'file':
			case 'icon':
			case 'status':
				v = s || null;
				// numeric select (e.g. redirect status code)
				if (v !== null && col?.dataType === 'number') v = Number(v);
				break;
			default:
				v = s || null;
		}
		if (f.required) {
			const empty = v === null || v === '' || (Array.isArray(v) && v.length === 0) || (f.type === 'boolean' && v === false && f.name !== 'consent');
			if (empty) errors[f.name] = 'Este campo es obligatorio.';
		}
		if (f.max && typeof v === 'string' && v.length > f.max) errors[f.name] = `Máximo ${f.max} caracteres (tienes ${v.length}).`;
		// Non-null text columns get '' instead of null
		if (v === null && col?.notNull && !col.hasDefault && (f.type === 'text' || f.type === 'textarea')) v = '';
		if (v === null && col?.notNull && col.hasDefault) continue; // let DB default apply
		values[f.name] = v;
	}
	return { values, errors };
}

/** Publishing rules: alt text required on published images (plan §12.4), consent for testimonials. */
export async function publishChecks(db: DB, def: ResourceDef, values: Record<string, unknown>) {
	const errors: Record<string, string> = {};
	if (values.status !== 'published') return errors;
	if (def.key === 'testimonios' && !values.consent) errors.consent = 'No se puede publicar un testimonio sin autorización.';
	const imageIds: [string, string][] = [];
	for (const f of def.fields) {
		const v = values[f.name];
		if (f.type === 'image' && typeof v === 'string') imageIds.push([f.name, v]);
		if (f.type === 'gallery' && Array.isArray(v)) v.forEach((g: { mediaId: string }) => imageIds.push([f.name, g.mediaId]));
	}
	if (imageIds.length) {
		const rows = await db.select({ id: media.id, alt: media.alt, mime: media.mime }).from(media).where(inArray(media.id, imageIds.map((x) => x[1])));
		for (const [field, id] of imageIds) {
			const m = rows.find((r) => r.id === id);
			if (m && m.mime.startsWith('image/') && !m.alt.trim()) {
				errors[field] = 'Hay imágenes sin texto alternativo. Complétalo en Medios antes de publicar.';
			}
		}
	}
	return errors;
}

/* ─────────── Mutations ─────────── */

function uniqueViolation(e: unknown): string | null {
	const err = e as { code?: string; cause?: { code?: string; constraint?: string; detail?: string }; detail?: string; constraint?: string };
	const code = err.code ?? err.cause?.code;
	if (code !== '23505') return null;
	const text = `${err.constraint ?? err.cause?.constraint ?? ''} ${err.detail ?? err.cause?.detail ?? ''}`;
	if (text.includes('slug')) return 'slug';
	if (text.includes('from_path')) return 'fromPath';
	return '_form';
}

export async function saveRow(db: DB, def: ResourceDef, id: string | null, values: Record<string, unknown>, user: SessionUser) {
	const c = cols(def);
	try {
		if (id) {
			const before = await getRow(db, def, id);
			if (!before) return { error: { _form: 'El registro no existe.' } };
			await db.insert(revisions).values({ entity: def.key, entityId: id, snapshot: before, userId: user.id, userName: user.name });
			if ('publishedAt' in c && values.status === 'published' && !values.publishedAt && !before.publishedAt) values.publishedAt = new Date();
			await (db as any).update(def.table).set(values).where(eq(c.id, id));
			const wasPublished = before.status === 'published';
			await audit(db, user, values.status === 'published' && !wasPublished ? 'publish' : 'update', def.key, id, String(values[def.titleField] ?? ''));
			return { id };
		}
		if ('publishedAt' in c && values.status === 'published' && !values.publishedAt) values.publishedAt = new Date();
		const [row] = await (db as any).insert(def.table).values(values).returning({ id: c.id });
		await audit(db, user, 'create', def.key, row.id, String(values[def.titleField] ?? ''));
		return { id: row.id as string };
	} catch (e) {
		const field = uniqueViolation(e);
		if (field === 'slug') return { error: { slug: 'Ya existe otro registro con esta URL. Cámbiala.' } };
		if (field === 'fromPath') return { error: { fromPath: 'Ya existe una redirección para esta ruta.' } };
		if (field) return { error: { _form: 'Ya existe un registro con estos datos.' } };
		throw e;
	}
}

export async function deleteRow(db: DB, def: ResourceDef, id: string, user: SessionUser) {
	const c = cols(def);
	const before = await getRow(db, def, id);
	if (!before) return;
	await db.insert(revisions).values({ entity: def.key, entityId: id, snapshot: before, userId: user.id, userName: user.name });
	await (db as any).delete(def.table).where(eq(c.id, id));
	await audit(db, user, 'delete', def.key, id, String(before[def.titleField] ?? ''));
}

export async function duplicateRow(db: DB, def: ResourceDef, id: string, user: SessionUser) {
	const before = await getRow(db, def, id);
	if (!before) return null;
	const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = before;
	void _id;
	void _c;
	void _u;
	const copy: Record<string, unknown> = { ...rest };
	copy[def.titleField] = `${before[def.titleField]} (copia)`;
	if ('slug' in copy) copy.slug = `${before.slug}-copia-${Date.now().toString(36).slice(-4)}`;
	if ('status' in copy) copy.status = 'draft';
	if ('publishedAt' in copy) copy.publishedAt = null;
	const [row] = await (db as any).insert(def.table).values(copy).returning({ id: cols(def).id });
	await audit(db, user, 'create', def.key, row.id, `Duplicado de ${before[def.titleField]}`);
	return row.id as string;
}

/** Moves a row up/down by normalising sortOrder values. */
export async function moveRow(db: DB, def: ResourceDef, id: string, dir: -1 | 1) {
	const c = cols(def);
	const rows: { id: string }[] = await (db as any).select({ id: c.id }).from(def.table).orderBy(asc(c.sortOrder), asc(c.createdAt ?? c.id));
	const i = rows.findIndex((r) => r.id === id);
	const j = i + dir;
	if (i < 0 || j < 0 || j >= rows.length) return;
	[rows[i], rows[j]] = [rows[j], rows[i]];
	await Promise.all(rows.map((r, idx) => (db as any).update(def.table).set({ sortOrder: idx * 10 }).where(eq(c.id, r.id))));
}

export async function listRevisions(db: DB, def: ResourceDef, id: string) {
	return db
		.select({ id: revisions.id, userName: revisions.userName, createdAt: revisions.createdAt })
		.from(revisions)
		.where(and(eq(revisions.entity, def.key), eq(revisions.entityId, id)))
		.orderBy(desc(revisions.createdAt))
		.limit(15);
}

export async function restoreRevision(db: DB, def: ResourceDef, id: string, revisionId: string, user: SessionUser) {
	const [rev] = await db.select().from(revisions).where(and(eq(revisions.id, revisionId), eq(revisions.entityId, id))).limit(1);
	if (!rev) return false;
	const c = cols(def);
	const snapshot = rev.snapshot as Record<string, unknown>;
	const values: Record<string, unknown> = {};
	for (const key of Object.keys(c)) {
		if (['id', 'createdAt', 'updatedAt'].includes(key) || !(key in snapshot)) continue;
		const v = snapshot[key];
		values[key] = c[key].columnType === 'PgTimestamp' && typeof v === 'string' ? new Date(v) : v;
	}
	const current = await getRow(db, def, id);
	if (current) {
		await db.insert(revisions).values({ entity: def.key, entityId: id, snapshot: current, userId: user.id, userName: user.name });
		await (db as any).update(def.table).set(values).where(eq(c.id, id));
	} else {
		await (db as any).insert(def.table).values({ ...values, id });
	}
	await audit(db, user, 'restore', def.key, id, String(values[def.titleField] ?? ''));
	return true;
}

/** Serialises a DB row for the edit form (dates → input strings). */
export function rowToForm(def: ResourceDef, row: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const f of def.fields) {
		const v = row[f.name];
		if (f.type === 'datetime' && v) {
			const d = new Date(v as string);
			// to America/Santiago local "YYYY-MM-DDTHH:mm"
			const parts = new Intl.DateTimeFormat('sv-SE', {
				timeZone: 'America/Santiago',
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit'
			}).format(d);
			out[f.name] = parts.replace(' ', 'T');
		} else if (f.type === 'list') out[f.name] = Array.isArray(v) ? (v as string[]).join('\n') : '';
		else if (f.type === 'decimal' && v !== null && v !== undefined) out[f.name] = String(v).replace('.', ',');
		else out[f.name] = v ?? (f.type === 'boolean' ? false : f.type === 'multirelation' || f.type === 'gallery' ? [] : '');
	}
	return out;
}

export type { FieldDef };
