/** Normalises Chilean phone numbers to "+56 X XXXX XXXX". Returns null when it does not look valid. */
export function normalizeChileanPhone(value: string): string | null {
	let digits = value.replace(/\D/g, '');
	if (digits.startsWith('56') && digits.length === 11) digits = digits.slice(2);
	if (digits.length === 8) digits = '9' + digits; // legacy mobile without the leading 9
	if (digits.length !== 9) return null;
	return `+56 ${digits[0]} ${digits.slice(1, 5)} ${digits.slice(5)}`;
}

/** Digits only, for tel: and wa.me links. */
export function phoneDigits(value: string | null | undefined): string {
	return (value ?? '').replace(/\D/g, '');
}
