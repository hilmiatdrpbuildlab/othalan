const nf = new Intl.NumberFormat('es-CL');
const nf1 = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 });
const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const TZ = 'America/Santiago';

export const formatNumber = (n: number | string | null | undefined) =>
	n === null || n === undefined || n === '' ? '' : nf1.format(Number(n));
export const formatInt = (n: number | null | undefined) => (n === null || n === undefined ? '' : nf.format(n));
export const formatClp = (n: number | null | undefined) => (n === null || n === undefined ? '' : clp.format(n));

function toDate(d: Date | string): Date {
	if (d instanceof Date) return d;
	// Plain dates (YYYY-MM-DD) are anchored at noon so the timezone never shifts the day.
	return new Date(d.length === 10 ? `${d}T12:00:00` : d);
}

/** 17-10-2026 */
export function formatDate(d: Date | string | null | undefined): string {
	if (!d) return '';
	return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TZ })
		.format(toDate(d))
		.replace(/\//g, '-');
}

/** 17 de octubre de 2026 */
export function formatDateLong(d: Date | string | null | undefined): string {
	if (!d) return '';
	return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeZone: TZ }).format(toDate(d));
}

export function formatDateTime(d: Date | string | null | undefined): string {
	if (!d) return '';
	return new Intl.DateTimeFormat('es-CL', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: TZ
	}).format(toDate(d));
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${nf1.format(bytes / 1024)} KB`;
	return `${nf1.format(bytes / 1024 / 1024)} MB`;
}

/** Parses "1.250,5", "1.250" or "3.5" into a number. */
export function parseLocaleNumber(value: string): number | null {
	const v = value.trim();
	if (!v) return null;
	const normalized = v.includes(',')
		? v.replace(/\./g, '').replace(',', '.')
		: /^\d{1,3}(\.\d{3})+$/.test(v)
			? v.replace(/\./g, '')
			: v;
	const n = Number(normalized);
	return Number.isFinite(n) ? n : null;
}
