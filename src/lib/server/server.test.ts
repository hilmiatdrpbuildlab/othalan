import { describe, expect, it } from 'vitest';
import { santiagoLocalToDate } from './cms/engine';
import { renderMarkdown } from './markdown';
import { hashPassword, passwordProblem, verifyPassword } from './auth';

describe('santiagoLocalToDate (DST aware)', () => {
	it('uses UTC-3 in the southern summer (DST)', () => {
		expect(santiagoLocalToDate('2026-10-17T09:30').toISOString()).toBe('2026-10-17T12:30:00.000Z');
	});
	it('uses UTC-4 in winter', () => {
		expect(santiagoLocalToDate('2026-06-15T09:30').toISOString()).toBe('2026-06-15T13:30:00.000Z');
	});
});

describe('renderMarkdown sanitisation', () => {
	it('escapes raw HTML', () => {
		const html = renderMarkdown('Hola <script>alert(1)</script> <img src=x onerror=alert(1)>');
		expect(html).not.toContain('<script');
		expect(html).not.toContain('<img src=x');
		expect(html).toContain('&lt;script&gt;');
	});
	it('neutralises javascript: links', () => {
		const html = renderMarkdown('[clic](javascript:alert(1))');
		expect(html).toContain('href="#"');
	});
	it('marks external links', () => {
		expect(renderMarkdown('[x](https://example.com)')).toContain('rel="noopener noreferrer"');
		expect(renderMarkdown('[x](/contacto)')).not.toContain('target=');
	});
});

describe('passwords', () => {
	it('hashes and verifies', async () => {
		const h = await hashPassword('Faena2026segura');
		expect(h.startsWith('pbkdf2_sha256$100000$')).toBe(true);
		expect(await verifyPassword('Faena2026segura', h)).toBe(true);
		expect(await verifyPassword('otra', h)).toBe(false);
	});
	it('enforces policy', () => {
		expect(passwordProblem('corta1')).not.toBeNull();
		expect(passwordProblem('soloLetrasLargas')).not.toBeNull();
		expect(passwordProblem('Larga2026segura')).toBeNull();
	});
});
