import { describe, expect, it } from 'vitest';
import { isValidRut, formatRut } from './rut';
import { normalizeChileanPhone } from './phone';
import { parseLocaleNumber } from './format';
import { slugify } from './slug';
import { splitHighlight } from './highlight';

describe('rut', () => {
	it('validates módulo 11', () => {
		expect(isValidRut('11.111.111-1')).toBe(true);
		expect(isValidRut('11.111.111-2')).toBe(false);
		expect(isValidRut('12.345.678-5')).toBe(true);
		expect(isValidRut('5.126.663-3')).toBe(true);
		expect(isValidRut('abc')).toBe(false);
	});
	it('formats', () => expect(formatRut('123456785')).toBe('12.345.678-5'));
});

describe('phone', () => {
	it('normalises +56', () => {
		expect(normalizeChileanPhone('+56 9 1234 5678')).toBe('+56 9 1234 5678');
		expect(normalizeChileanPhone('912345678')).toBe('+56 9 1234 5678');
		expect(normalizeChileanPhone('+56 2 2345 6789')).toBe('+56 2 2345 6789');
		expect(normalizeChileanPhone('123')).toBeNull();
	});
});

describe('misc', () => {
	it('parses es-CL numbers', () => {
		expect(parseLocaleNumber('1.250,5')).toBe(1250.5);
		expect(parseLocaleNumber('1.250')).toBe(1250);
		expect(parseLocaleNumber('3.5')).toBe(3.5);
		expect(parseLocaleNumber('')).toBeNull();
	});
	it('slugifies', () => expect(slugify('Montaje Industrial y Ñandú')).toBe('montaje-industrial-y-nandu'));
	it('highlights', () =>
		expect(splitHighlight('Construimos *estructuras* que duran')).toEqual([
			{ text: 'Construimos ', mark: false },
			{ text: 'estructuras', mark: true },
			{ text: ' que duran', mark: false }
		]));
});
