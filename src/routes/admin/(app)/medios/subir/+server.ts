import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { requirePermission } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { media } from '$lib/server/db/schema';
import { getStorage, publicKey } from '$lib/server/storage';

const ALLOWED: Record<string, { ext: string; max: number }> = {
	'image/webp': { ext: 'webp', max: 20 * 1024 * 1024 },
	'image/jpeg': { ext: 'jpg', max: 20 * 1024 * 1024 },
	'image/png': { ext: 'png', max: 20 * 1024 * 1024 },
	'image/avif': { ext: 'avif', max: 20 * 1024 * 1024 },
	'image/svg+xml': { ext: 'svg', max: 2 * 1024 * 1024 },
	'application/pdf': { ext: 'pdf', max: 25 * 1024 * 1024 }
};

/** CMS upload: the browser has already resized/re-encoded images (see $lib/cms/upload.ts). */
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requirePermission(locals.user, 'media', 'write');
	const form = await request.formData();
	const file = form.get('file');
	if (!(file instanceof File) || !file.size) error(400, 'No se recibió ningún archivo.');
	const rule = ALLOWED[file.type];
	if (!rule) error(400, `Formato no permitido (${file.type || 'desconocido'}). Usa JPG, PNG, WebP, AVIF, SVG o PDF.`);
	if (file.size > rule.max) error(400, `El archivo supera ${Math.round(rule.max / 1024 / 1024)} MB.`);

	const bytes = new Uint8Array(await file.arrayBuffer());
	if (file.type === 'image/svg+xml') {
		const text = new TextDecoder().decode(bytes);
		if (/<script|on\w+\s*=|javascript:/i.test(text)) error(400, 'El SVG contiene scripts y no puede subirse.');
	}
	const key = publicKey(rule.ext);
	await getStorage(env).put(key, bytes, file.type);

	const num = (k: string) => {
		const n = Number(form.get(k));
		return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
	};
	const color = String(form.get('dominantColor') ?? '');
	const [row] = await locals.db
		.insert(media)
		.values({
			storageKey: key,
			filename: file.name.slice(0, 200),
			mime: file.type,
			bytes: file.size,
			width: num('width'),
			height: num('height'),
			dominantColor: /^#[0-9a-f]{6}$/i.test(color) ? color : null,
			alt: String(form.get('alt') ?? '').slice(0, 300),
			folder: String(form.get('folder') ?? 'general').slice(0, 40) || 'general',
			uploadedBy: user.id
		})
		.returning();
	await audit(locals.db, user, 'upload', 'media', row.id, file.name);
	return json({
		id: row.id,
		storageKey: row.storageKey,
		mime: row.mime,
		filename: row.filename,
		alt: row.alt,
		width: row.width,
		height: row.height,
		bytes: row.bytes,
		dominantColor: row.dominantColor
	});
};
