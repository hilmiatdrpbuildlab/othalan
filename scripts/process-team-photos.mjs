// Re-composites the "Equipo directivo" portraits from their transparent cutouts:
//  1. Cleans the alpha matte (removes thin spurs / jagged fringes left by background removal).
//  2. Decontaminates edge colours (replaces leftover wall colour with colour extrapolated from the subject).
//  3. Places the subject on a uniform Hormigón studio backdrop with a soft contact shadow.
// Output: 1200×1500 (4:5) JPG + WebP in assets/stakeholders/edited/.
// Usage: npm run photos:team
import sharp from 'sharp';
import { mkdir, copyFile, access } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.resolve('assets/stakeholders/edited');
const PEOPLE = ['juan-marcelo-escalona-aranda', 'simon-calaf-aguilera', 'consuelo-escalona'];
// Per-person fixes: `erase` = matte areas to clear (x, y, w, h); `decyan` = neutralise cool cast picked up
// from the original blue wall on light clothing.
const FIXES = {
	// eraseLeft: clear the matte left of the line (xTop,yTop)→(xBottom,yBottom), from xMin.
	'simon-calaf-aguilera': { eraseLeft: [[406, 735, 420, 805, 360]] },
	'consuelo-escalona': { decyan: true }
};
const W = 1200;
const H = 1500;

/** Separable Gaussian blur of a single-channel float plane (edges clamped). */
async function blurPlane(plane, sigma) {
	const r = Math.ceil(sigma * 3);
	const k = new Float32Array(r * 2 + 1);
	let sum = 0;
	for (let i = -r; i <= r; i++) sum += k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma));
	for (let i = 0; i < k.length; i++) k[i] /= sum;
	const tmp = new Float32Array(W * H);
	const out = new Float32Array(W * H);
	for (let y = 0; y < H; y++) {
		const row = y * W;
		for (let x = 0; x < W; x++) {
			let acc = 0;
			for (let j = -r; j <= r; j++) acc += plane[row + Math.min(W - 1, Math.max(0, x + j))] * k[j + r];
			tmp[row + x] = acc;
		}
	}
	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			let acc = 0;
			for (let j = -r; j <= r; j++) acc += tmp[Math.min(H - 1, Math.max(0, y + j)) * W + x] * k[j + r];
			out[y * W + x] = acc;
		}
	}
	return out;
}
const blurFloat = blurPlane;

function backdropSvg() {
	// Uniform studio backdrop: concrete-25/50 centre falling off to a warm concrete-200 edge.
	return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
	<defs>
		<radialGradient id="g" cx="50%" cy="34%" r="78%">
			<stop offset="0%" stop-color="#F7F5F0"/>
			<stop offset="55%" stop-color="#ECE9E3"/>
			<stop offset="100%" stop-color="#D3CEC5"/>
		</radialGradient>
		<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="#000" stop-opacity="0"/>
			<stop offset="100%" stop-color="#2F2E2B" stop-opacity="0.08"/>
		</linearGradient>
	</defs>
	<rect width="100%" height="100%" fill="url(#g)"/>
	<rect y="${H * 0.55}" width="100%" height="${H * 0.45}" fill="url(#floor)"/>
</svg>`);
}

async function processPerson(slug) {
	const src = path.join(DIR, `${slug}-cutout.png`);
	const { data, info } = await sharp(src).ensureAlpha().resize(W, H, { fit: 'cover' }).raw().toBuffer({ resolveWithObject: true });
	if (info.channels !== 4) throw new Error('expected RGBA');
	const n = W * H;
	const fix = FIXES[slug] ?? {};
	const alpha = new Float32Array(n);
	for (let i = 0; i < n; i++) alpha[i] = data[i * 4 + 3] / 255;
	for (const [xt, yt, xb, yb, xMin] of fix.eraseLeft ?? []) {
		for (let y = yt; y <= yb; y++) {
			const edge = xt + ((y - yt) * (xb - xt)) / (yb - yt);
			for (let x = xMin; x < edge; x++) alpha[y * W + x] = 0;
		}
	}
	if (fix.decyan) {
		// Light, cyan-leaning pixels (G,B > R) are pulled back to the warm cream of the garment.
		for (let i = 0; i < n; i++) {
			const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
			const lum = 0.299 * r + 0.587 * g + 0.114 * b;
			const cyan = ((g + b) / 2 - r) / 255;
			if (alpha[i] === 0 || lum < 110 || cyan <= 0) continue;
			const k = Math.min(1, cyan * 9);
			const target = [lum * 1.04, lum * 1.0, lum * 0.88];
			for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.round(Math.min(255, data[i * 4 + c] * (1 - k) + target[c] * k));
		}
	}

	// 1) Morphological "opening" approximation: blur + threshold removes spurs thinner than ~2σ.
	const blurred = await blurPlane(alpha, 4);
	const mask = new Float32Array(n);
	for (let i = 0; i < n; i++) mask[i] = blurred[i] > 0.5 ? 1 : 0;
	const smoothMask = await blurPlane(mask, 1.1);
	const cleanAlpha = new Float32Array(n);
	for (let i = 0; i < n; i++) cleanAlpha[i] = Math.min(alpha[i], smoothMask[i] < 0.02 ? 0 : smoothMask[i]);
	// Keep hair-level detail where the original matte was confident and the cleaned mask agrees nearby.
	for (let i = 0; i < n; i++) if (alpha[i] > 0.9 && blurred[i] > 0.35) cleanAlpha[i] = Math.max(cleanAlpha[i], alpha[i]);

	// 2) Edge colour decontamination: extrapolate colour from the confident interior.
	const interior = new Float32Array(n);
	const erodeSrc = await blurPlane(cleanAlpha, 3);
	for (let i = 0; i < n; i++) interior[i] = erodeSrc[i] > 0.97 ? 1 : 0;
	const wBlur = await blurFloat(interior, 6);
	const fill = [0, 1, 2].map(() => new Float32Array(n));
	for (let c = 0; c < 3; c++) {
		const pre = new Float32Array(n);
		for (let i = 0; i < n; i++) pre[i] = (data[i * 4 + c] / 255) * interior[i];
		const b = await blurFloat(pre, 6);
		for (let i = 0; i < n; i++) fill[c][i] = wBlur[i] > 1e-3 ? b[i] / wBlur[i] : data[i * 4 + c] / 255;
	}

	const fg = Buffer.alloc(n * 4);
	for (let i = 0; i < n; i++) {
		const a = cleanAlpha[i];
		// Edge band = visible but not interior. Mix towards extrapolated colour there.
		const edge = interior[i] ? 0 : Math.min(1, (1 - erodeSrc[i]) * 1.6);
		const k = a > 0 ? edge * 0.85 : 0;
		for (let c = 0; c < 3; c++) {
			const v = (data[i * 4 + c] / 255) * (1 - k) + fill[c][i] * k;
			fg[i * 4 + c] = Math.round(Math.max(0, Math.min(1, v)) * 255);
		}
		fg[i * 4 + 3] = Math.round(a * 255);
	}

	// 3) Soft shadow from the cleaned matte, offset down-right.
	const shadowPlane = await blurPlane(cleanAlpha, 22);
	const shadow = Buffer.alloc(n * 4);
	const dx = 14;
	const dy = 18;
	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			const sx = x - dx;
			const sy = y - dy;
			const v = sx >= 0 && sy >= 0 ? shadowPlane[sy * W + sx] : 0;
			const o = (y * W + x) * 4;
			shadow[o] = 28;
			shadow[o + 1] = 27;
			shadow[o + 2] = 25;
			shadow[o + 3] = Math.round(v * 0.28 * 255);
		}
	}

	const raw = { raw: { width: W, height: H, channels: 4 } };
	const composed = await sharp(backdropSvg())
		.composite([
			{ input: shadow, ...raw },
			{ input: fg, ...raw }
		])
		.removeAlpha()
		.toBuffer();

	const final = sharp(composed).modulate({ saturation: 1.02 }).sharpen({ sigma: 0.6, m1: 0.4, m2: 1.2 });
	await final.clone().jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(path.join(DIR, `${slug}.jpg`));
	await final.clone().webp({ quality: 84 }).toFile(path.join(DIR, `${slug}.webp`));
	console.log(`✓ ${slug}`);
}

const backup = path.join(DIR, '_v1');
await mkdir(backup, { recursive: true });
for (const slug of PEOPLE) {
	for (const ext of ['jpg', 'webp']) {
		const file = path.join(DIR, `${slug}.${ext}`);
		const dest = path.join(backup, `${slug}.${ext}`);
		try {
			await access(dest);
		} catch {
			await copyFile(file, dest).catch(() => {});
		}
	}
	await processPerson(slug);
}
