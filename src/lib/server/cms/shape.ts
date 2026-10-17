/** Reads a nested object from FormData following the shape of a default object. Field names use dot paths: "hero.features.0.title". */
export function readShape<T>(shape: T, prefix: string, form: FormData): T {
	if (Array.isArray(shape)) return shape.map((item, i) => readShape(item, `${prefix}.${i}`, form)) as T;
	if (shape && typeof shape === 'object') {
		return Object.fromEntries(Object.entries(shape).map(([k, v]) => [k, readShape(v, `${prefix}.${k}`, form)])) as T;
	}
	if (typeof shape === 'boolean') return (form.get(prefix) === 'on') as T;
	return String(form.get(prefix) ?? '')
		.trim()
		.slice(0, 2000) as T;
}
