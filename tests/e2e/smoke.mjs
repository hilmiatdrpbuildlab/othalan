// End-to-end smoke test against a running dev server (npm run dev).
// Usage: node tests/e2e/smoke.mjs <email> <password> [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [, , email, password, out = '.data/shots'] = process.argv;
const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
let failures = 0;
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
page.on('dialog', (d) => d.accept());

/** Navigate and wait until Svelte has hydrated (inputs filled earlier would be reset). */
async function go(p, url) {
	await p.goto(url);
	await p.waitForSelector('html[data-hydrated]', { state: 'attached' });
}

const step = async (name, fn) => {
	try {
		await fn();
		console.log(`✓ ${name}`);
	} catch (e) {
		failures++;
		console.log(`✗ ${name}: ${e.message.split('\n')[0]}`);
		await page.screenshot({ path: `${out}/FAIL-${name.replace(/\W+/g, '-')}.png` }).catch(() => {});
	}
};

await step('login', async () => {
	await go(page, `${BASE}/admin`);
	await page.fill('#email', email);
	await page.fill('#password', password);
	await page.click('.box button.btn--primary');
	await page.waitForURL(`${BASE}/admin`, { waitUntil: 'commit' });
	await page.waitForLoadState('networkidle');
	await page.screenshot({ path: `${out}/admin-dashboard.png`, fullPage: true });
});

await step('publish projects', async () => {
	await go(page, `${BASE}/admin/c/proyectos`);
	await page.screenshot({ path: `${out}/admin-projects.png` });
	const links = await page.locator('a.row-link').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
	if (!links.length) throw new Error('no projects listed');
	for (const href of links) {
		await go(page, `${BASE}${href}`);
		await page.selectOption('#f-status', 'published');
		await page.fill('#f-year', '2026');
		await page.selectOption('#f-region', 'Metropolitana de Santiago');
		await page.click('button[value=save]');
		await page.waitForLoadState('networkidle');
		if (await page.locator('.error-summary').count()) throw new Error('validation: ' + (await page.locator('.error-summary').innerText()));
	}
	await go(page, `${BASE}${links[0]}`);
	await page.screenshot({ path: `${out}/admin-project-edit.png`, fullPage: true });
});

await step('public projects visible', async () => {
	await go(page, `${BASE}/proyectos`);
	const n = await page.locator('ul.grid > li').count();
	if (n !== 3) throw new Error(`expected 3 projects, got ${n}`);
});

await step('home builder save', async () => {
	await go(page, `${BASE}/admin/inicio`);
	await page.screenshot({ path: `${out}/admin-home.png`, fullPage: true });
	await page.click('button:has-text("Guardar cambios")');
	await page.waitForURL(/ok=guardado/);
});

await step('settings save + phone normalisation', async () => {
	await go(page, `${BASE}/admin/configuracion`);
	await page.fill('#f-whatsapp', '912345678');
	await page.fill('#f-phone', '+56 2 2345 6789');
	await page.click('.adm-page-head button.btn--primary');
	await page.waitForURL(/ok=guardado/);
	await page.waitForLoadState('networkidle');
	const v = await page.inputValue('#f-whatsapp');
	if (v !== '+56 9 1234 5678') throw new Error('phone not normalised: ' + v);
});

await step('media library + detail', async () => {
	await go(page, `${BASE}/admin/medios`);
	await page.screenshot({ path: `${out}/admin-media.png` });
	await page.locator('ul.grid .tile').first().click();
	await page.waitForURL(/medios\/[0-9a-f-]+/);
	await page.screenshot({ path: `${out}/admin-media-detail.png`, fullPage: true });
});

await step('upload image via library', async () => {
	await go(page, `${BASE}/admin/medios`);
	await page.setInputFiles('.pick input[type=file]', 'assets/logo.jpg');
	await page.waitForFunction(() => document.querySelectorAll('.queue .done, .queue .error').length > 0, null, { timeout: 30000 });
	if (await page.locator('.queue .error').count()) throw new Error(await page.locator('.queue .error').innerText());
});

await step('team edit page', async () => {
	await go(page, `${BASE}/admin/c/equipo`);
	await page.locator('a.row-link').first().click();
	await page.waitForURL(/c\/equipo\/[0-9a-f-]+/);
	await page.screenshot({ path: `${out}/admin-team-edit.png`, fullPage: true });
});

await step('create + delete service (slug autofill)', async () => {
	await go(page, `${BASE}/admin/c/servicios/nuevo`);
	await page.fill('#f-title', 'Prueba de servicio');
	await page.fill('#f-summary', 'Servicio de prueba creado por el test.');
	const slug = await page.inputValue('#f-slug');
	if (slug !== 'prueba-de-servicio') throw new Error('slug autofill: ' + slug);
	await page.click('button[value=save]');
	await page.waitForURL(/servicios\/[0-9a-f-]{36}/);
	await page.click('button:has-text("Eliminar")');
	await page.waitForURL(/c\/servicios\?ok=eliminado|c\/servicios$/);
});

const pub = await ctx.newPage();
pub.on('pageerror', (e) => errors.push(`pageerror(public): ${e.message}`));

await step('public RFQ multi-step submit', async () => {
	await go(pub, `${BASE}/cotizacion?servicio=montaje-y-soluciones-industriales`);
	await pub.waitForTimeout(3200); // anti-spam minimum fill time
	await pub.fill('#f-contactName', 'María González');
	await pub.fill('#f-company', 'Logística Andes SpA');
	await pub.fill('#f-rut', '12345678-5');
	await pub.fill('#f-email', 'maria@andes.cl');
	await pub.fill('#f-phone', '987654321');
	await pub.click('button:has-text("Continuar")');
	await pub.selectOption('#f-region', 'Valparaíso');
	await pub.fill('#f-comuna', 'San Antonio');
	await pub.click('button:has-text("Continuar")');
	await pub.fill('#f-description', 'Necesitamos barreras de protección para racks en una bodega de 1.200 m².');
	await pub.setInputFiles('#f-files', 'assets/works/logo.jpg');
	await pub.click('button:has-text("Continuar")');
	await pub.screenshot({ path: `${out}/rfq-review.png`, fullPage: true });
	await pub.check('#f-consent');
	await pub.click('button[type=submit]');
	await pub.waitForURL(/cotizacion\/gracias/, { timeout: 30000 });
	await pub.screenshot({ path: `${out}/rfq-thanks.png` });
	console.log('   ticket:', new URL(pub.url()).searchParams.get('ticket'));
});

await step('RFQ in CMS + attachment download + status', async () => {
	await go(page, `${BASE}/admin/cotizaciones`);
	await page.locator('a.row-link').first().click();
	await page.waitForURL(/cotizaciones\/[0-9a-f-]+/);
	await page.screenshot({ path: `${out}/admin-rfq-detail.png`, fullPage: true });
	const href = await page.locator('.files a').first().getAttribute('href');
	const res = await page.request.get(`${BASE}${href}`);
	if (res.status() !== 200) throw new Error('download status ' + res.status());
	await page.selectOption('#status', 'en_revision');
	await page.click('form[action="?/update"] button');
	await page.waitForURL(/ok=guardado/);
});

await step('anonymous cannot download private file', async () => {
	const anon = await browser.newContext();
	const res = await anon.request.get(`${BASE}/admin/archivos/rfq/x/y.pdf`, { maxRedirects: 0 });
	if (res.status() !== 303) throw new Error('expected redirect to login, got ' + res.status());
	await anon.close();
});

await step('contact form', async () => {
	await go(pub, `${BASE}/contacto`);
	await pub.waitForTimeout(3200);
	await pub.fill('#f-name', 'Pedro Soto');
	await pub.fill('#f-email', 'pedro@example.cl');
	await pub.fill('#f-message', 'Quisiera información sobre mantención de pavimentos.');
	await pub.check('#f-consent');
	await pub.click('button:has-text("Enviar mensaje")');
	await pub.waitForSelector('.sent', { timeout: 15000 });
});

await step('honeypot blocks bots', async () => {
	const res = await pub.request.post(`${BASE}/contacto`, {
		form: { name: 'Bot', email: 'bot@x.cl', message: 'spam spam spam', consent: 'on', sitio_web: 'http://spam', _ts: '1' },
		headers: { origin: BASE }
	});
	const body = await res.text();
	if (!body.includes('No pudimos procesar')) throw new Error('honeypot not triggered');
});

await step('CSV export', async () => {
	const res = await page.request.get(`${BASE}/admin/cotizaciones/exportar`);
	const text = await res.text();
	if (!text.includes('RFQ-')) throw new Error('csv missing data');
});

console.log(errors.length ? `\nBrowser errors:\n${[...new Set(errors)].join('\n')}` : '\nNo browser errors');
console.log(failures ? `\n${failures} step(s) failed` : '\nAll steps passed');
await browser.close();
process.exit(failures ? 1 : 0);
