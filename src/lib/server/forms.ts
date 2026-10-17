import { env } from '$env/dynamic/private';
import { sha256 } from './auth';
import { getStorage, privateKey } from './storage';

export const HONEYPOT = 'sitio_web';
export const TIMESTAMP = '_ts';
const MIN_FILL_MS = 3000;

/** Hashes the client IP with a server secret (no raw IPs are stored). */
export async function hashIp(ip: string | null | undefined) {
	if (!ip) return null;
	return (await sha256(`${ip}:${env.SESSION_SECRET ?? 'othalan'}`)).slice(0, 32);
}

async function verifyTurnstile(token: string | null, ip: string | null) {
	if (!env.TURNSTILE_SECRET_KEY) return true;
	if (!token) return false;
	const body = new FormData();
	body.append('secret', env.TURNSTILE_SECRET_KEY);
	body.append('response', token);
	if (ip) body.append('remoteip', ip);
	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
	const json = (await res.json()) as { success: boolean };
	return json.success;
}

/**
 * Anti-spam pipeline shared by every public form: honeypot, minimum fill time,
 * Cloudflare Rate Limiting binding (5/min/IP) and Turnstile when configured.
 * Returns an error message in Spanish, or null when the submission may proceed.
 */
export async function guardSubmission(form: FormData, ip: string | null, platform: App.Platform | undefined): Promise<string | null> {
	if (String(form.get(HONEYPOT) ?? '').length > 0) return 'No pudimos procesar el formulario.';
	const ts = Number(form.get(TIMESTAMP));
	if (!ts || Date.now() - ts < MIN_FILL_MS) return 'El formulario se envió demasiado rápido. Inténtalo nuevamente.';
	const limiter = platform?.env?.FORM_LIMITER;
	if (limiter && ip) {
		const { success } = await limiter.limit({ key: ip });
		if (!success) return 'Demasiados envíos seguidos. Espera un minuto e inténtalo otra vez.';
	}
	if (!(await verifyTurnstile(form.get('cf-turnstile-response') as string | null, ip))) {
		return 'No pudimos verificar que no eres un robot. Recarga la página e inténtalo de nuevo.';
	}
	return null;
}

export type UploadRule = { maxFiles: number; maxBytes: number; extensions: string[] };

export const RULES = {
	rfq: { maxFiles: 10, maxBytes: 25 * 1024 * 1024, extensions: ['pdf', 'dwg', 'dxf', 'jpg', 'jpeg', 'png', 'xlsx', 'xls', 'docx', 'doc', 'zip'] },
	cv: { maxFiles: 1, maxBytes: 5 * 1024 * 1024, extensions: ['pdf', 'docx', 'doc'] },
	supplier: { maxFiles: 1, maxBytes: 10 * 1024 * 1024, extensions: ['pdf', 'zip', 'docx'] }
} satisfies Record<string, UploadRule>;

const MAX_TOTAL = 90 * 1024 * 1024; // stay under the Workers request body limit

const MIME_FALLBACK: Record<string, string> = {
	pdf: 'application/pdf',
	dwg: 'application/acad',
	dxf: 'application/dxf',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	xls: 'application/vnd.ms-excel',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	doc: 'application/msword',
	zip: 'application/zip'
};

/** Validates uploaded files from a multipart form. Returns files or a Spanish error. */
export function collectFiles(form: FormData, field: string, rule: UploadRule): { files: File[]; error?: string } {
	const files = form.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
	if (files.length > rule.maxFiles) return { files: [], error: `Puedes adjuntar como máximo ${rule.maxFiles} archivo(s).` };
	let total = 0;
	for (const f of files) {
		const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
		if (!rule.extensions.includes(ext)) return { files: [], error: `Formato no permitido: ${f.name}. Usa ${rule.extensions.join(', ').toUpperCase()}.` };
		if (f.size > rule.maxBytes) return { files: [], error: `${f.name} supera el máximo de ${Math.round(rule.maxBytes / 1024 / 1024)} MB.` };
		total += f.size;
	}
	if (total > MAX_TOTAL) return { files: [], error: 'Los archivos superan el tamaño total permitido (90 MB).' };
	return { files };
}

export async function storePrivateFile(folder: 'rfq' | 'cv' | 'suppliers', parentId: string, file: File) {
	const key = privateKey(folder, parentId, file.name);
	const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
	const mime = file.type || MIME_FALLBACK[ext] || 'application/octet-stream';
	await getStorage(env).put(key, new Uint8Array(await file.arrayBuffer()), mime);
	return { key, mime, bytes: file.size, filename: file.name };
}

export const str = (form: FormData, name: string, max = 2000) => String(form.get(name) ?? '').trim().slice(0, max);
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
