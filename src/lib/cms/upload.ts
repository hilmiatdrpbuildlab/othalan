import type { MediaInfo } from './types';

const MAX_SIDE = 2560;
const REENCODE = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif'];

type Prepared = { blob: Blob; filename: string; width?: number; height?: number; dominantColor?: string };

/**
 * Browser-side processing (Workers cannot run sharp): applies EXIF orientation, downsizes to 2560 px,
 * re-encodes to WebP (which also strips EXIF/GPS metadata) and samples a dominant colour for placeholders.
 */
export async function prepareFile(file: File): Promise<Prepared> {
	if (!REENCODE.includes(file.type)) {
		if (file.type === 'image/svg+xml') {
			const text = await file.text();
			const vb = text.match(/viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/);
			return { blob: file, filename: file.name, width: vb ? Math.round(+vb[1]) : undefined, height: vb ? Math.round(+vb[2]) : undefined };
		}
		return { blob: file, filename: file.name };
	}
	const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
	const width = Math.round(bitmap.width * scale);
	const height = Math.round(bitmap.height * scale);
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(bitmap, 0, 0, width, height);

	const dot = document.createElement('canvas');
	dot.width = dot.height = 1;
	const dctx = dot.getContext('2d')!;
	dctx.drawImage(canvas, 0, 0, 1, 1);
	const [r, g, b] = dctx.getImageData(0, 0, 1, 1).data;
	const dominantColor = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

	const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/webp', 0.85));
	bitmap.close();
	return { blob, filename: file.name.replace(/\.\w+$/, '') + '.webp', width, height, dominantColor };
}

export async function uploadMedia(file: File, opts: { folder?: string; alt?: string } = {}): Promise<MediaInfo> {
	const p = await prepareFile(file);
	const body = new FormData();
	body.append('file', p.blob, p.filename);
	if (p.width) body.append('width', String(p.width));
	if (p.height) body.append('height', String(p.height));
	if (p.dominantColor) body.append('dominantColor', p.dominantColor);
	body.append('folder', opts.folder ?? 'general');
	body.append('alt', opts.alt ?? '');
	const res = await fetch('/admin/medios/subir', { method: 'POST', body });
	if (!res.ok) {
		const msg = (await res.json().catch(() => ({ message: 'Error al subir' }))) as { message?: string };
		throw new Error(msg.message ?? 'Error al subir');
	}
	return res.json();
}
