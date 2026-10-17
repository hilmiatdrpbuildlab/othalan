/** Chilean RUT utilities (módulo 11). */
export function cleanRut(value: string): string {
	return value.replace(/[^0-9kK]/g, '').toUpperCase();
}

export function computeDv(body: string): string {
	let sum = 0;
	let mul = 2;
	for (let i = body.length - 1; i >= 0; i--) {
		sum += Number(body[i]) * mul;
		mul = mul === 7 ? 2 : mul + 1;
	}
	const res = 11 - (sum % 11);
	return res === 11 ? '0' : res === 10 ? 'K' : String(res);
}

export function isValidRut(value: string): boolean {
	const clean = cleanRut(value);
	if (clean.length < 2) return false;
	const body = clean.slice(0, -1);
	const dv = clean.slice(-1);
	if (!/^\d{1,8}$/.test(body)) return false;
	return computeDv(body) === dv;
}

/** 123456785 → 12.345.678-5 */
export function formatRut(value: string): string {
	const clean = cleanRut(value);
	if (clean.length < 2) return value;
	const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	return `${body}-${clean.slice(-1)}`;
}
