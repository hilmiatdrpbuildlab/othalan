import { Marked, type Tokens } from 'marked';

const escapeHtml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const SAFE_URL = /^(https?:|mailto:|tel:|\/(?!\/)|#)/i;
const safeUrl = (href: string) => (SAFE_URL.test(href.trim()) ? href.trim() : '#');

/**
 * Markdown → HTML for CMS rich text. Raw HTML in the source is escaped (never executed) and
 * links/images are restricted to safe protocols, so editor content cannot inject scripts.
 */
const md = new Marked({
	gfm: true,
	breaks: true,
	renderer: {
		html(token: Tokens.HTML | Tokens.Tag) {
			return escapeHtml(token.text);
		},
		link(token: Tokens.Link) {
			const href = safeUrl(token.href);
			const text = this.parser.parseInline(token.tokens);
			const external = /^https?:/i.test(href) && !href.includes('othalan.cl');
			const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
			return `<a href="${escapeHtml(href)}"${title}${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
		},
		image(token: Tokens.Image) {
			const src = safeUrl(token.href);
			return `<img src="${escapeHtml(src)}" alt="${escapeHtml(token.text)}" loading="lazy" decoding="async">`;
		}
	}
});

export function renderMarkdown(source: string | null | undefined): string {
	if (!source?.trim()) return '';
	return md.parse(source, { async: false }) as string;
}
