import { env } from '$env/dynamic/public';

export type ImageRef = {
	storageKey: string;
	width?: number | null;
	height?: number | null;
	alt?: string | null;
	focalX?: number | null;
	focalY?: number | null;
	dominantColor?: string | null;
	mime?: string | null;
};

const transformsEnabled = () => env.PUBLIC_IMAGE_TRANSFORMS === 'true';

/** Public URL for a stored media object, optionally resized via Cloudflare Image Transformations. */
export function mediaUrl(key: string, opts: { w?: number; q?: number } = {}): string {
	const path = `/media/${key.replace(/^public\/media\//, '')}`;
	if (!opts.w || !transformsEnabled()) return path;
	return `/cdn-cgi/image/width=${opts.w},quality=${opts.q ?? 80},format=auto,fit=scale-down${path}`;
}

export const WIDTHS = [480, 768, 1024, 1440, 1920];

export function srcset(img: ImageRef): string | undefined {
	if (!transformsEnabled() || img.mime === 'image/svg+xml') return undefined;
	const max = img.width ?? 2560;
	const widths = WIDTHS.filter((w) => w <= max);
	if (!widths.length) return undefined;
	return widths.map((w) => `${mediaUrl(img.storageKey, { w })} ${w}w`).join(', ');
}
