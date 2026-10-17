export type HighlightPart = { text: string; mark: boolean };

/** Splits CMS heading text where *asterisks* mark the highlighted phrase (one per heading). */
export function splitHighlight(text: string | null | undefined): HighlightPart[] {
	if (!text) return [];
	return text
		.split(/(\*[^*]+\*)/g)
		.filter(Boolean)
		.map((t) => (t.startsWith('*') && t.endsWith('*') ? { text: t.slice(1, -1), mark: true } : { text: t, mark: false }));
}

export const stripHighlight = (text: string | null | undefined) => (text ?? '').replace(/\*/g, '');
