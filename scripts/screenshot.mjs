// Visual QA helper: node scripts/screenshot.mjs <path> <out.png> [width] [--full]
import { chromium } from 'playwright-core';
const [, , path = '/', out = 'shot.png', width = '1440', ...flags] = process.argv;
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(width) < 600 ? 800 : 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
const res = await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: '.cookie{display:none!important}' });
if (flags.includes('--full')) {
	// trigger lazy images
	await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
	await page.waitForTimeout(400);
}
const at = flags.find((f) => f.startsWith('--at='));
if (at) {
	await page.locator(at.slice(5)).first().scrollIntoViewIfNeeded();
	await page.waitForTimeout(800);
}
await page.waitForFunction(() => [...document.images].filter((i) => i.getBoundingClientRect().top < innerHeight * 3).every((i) => i.complete), null, { timeout: 5000 }).catch(() => {});
await page.screenshot({ path: out, fullPage: flags.includes('--full') });
console.log(`HTTP ${res?.status()} → ${out}${errors.length ? '\nERRORS:\n' + errors.join('\n') : ''}`);
await browser.close();
