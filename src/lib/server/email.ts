import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export type EmailMessage = {
	to: string | string[];
	subject: string;
	html: string;
	replyTo?: string;
};

/** Sends through Resend's HTTP API (Workers cannot speak SMTP). Without a key, logs to console (dev). */
export async function sendEmail(msg: EmailMessage): Promise<boolean> {
	const to = (Array.isArray(msg.to) ? msg.to : msg.to.split(/[,;\s]+/)).map((s) => s.trim()).filter(Boolean);
	if (!to.length) return false;
	if (!env.RESEND_API_KEY) {
		console.info(`[email:dev] to=${to.join(',')} subject="${msg.subject}"`);
		return true;
	}
	try {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				from: env.EMAIL_FROM || 'Othalan <no-reply@othalan.cl>',
				to,
				subject: msg.subject,
				html: msg.html,
				reply_to: msg.replyTo
			})
		});
		if (!res.ok) console.error('[email] Resend error', res.status, await res.text());
		return res.ok;
	} catch (e) {
		console.error('[email] failed', e);
		return false;
	}
}

const esc = (s: unknown) =>
	String(s ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

/** Branded, table-based HTML layout that renders in Gmail/Outlook. */
export function emailLayout(title: string, bodyHtml: string): string {
	const site = publicEnv.PUBLIC_SITE_URL || 'https://www.othalan.cl';
	return `<!doctype html><html lang="es"><body style="margin:0;background:#F3F1EC;font-family:Arial,Helvetica,sans-serif;color:#1C1B19">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1EC;padding:24px 0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden">
<tr><td style="background:#15181A;border-bottom:4px solid #F2D200;padding:20px 28px;color:#F2D200;font-size:22px;font-weight:bold;letter-spacing:2px">OTHALAN
<div style="color:#B9B4AA;font-size:11px;letter-spacing:1px;font-weight:normal">INGENIERÍA Y CONSTRUCCIÓN</div></td></tr>
<tr><td style="padding:28px">
<h1 style="font-size:20px;margin:0 0 16px;text-transform:uppercase">${esc(title)}</h1>
${bodyHtml}
</td></tr>
<tr><td style="padding:16px 28px;background:#FAF8F4;color:#736F66;font-size:12px">Othalan Ingeniería y Construcción · <a href="${site}" style="color:#A84F22">${site.replace(/^https?:\/\//, '')}</a></td></tr>
</table></td></tr></table></body></html>`;
}

/** Key/value table for notification emails. */
export function emailTable(rows: [string, unknown][]): string {
	const tr = rows
		.filter(([, v]) => v !== null && v !== undefined && v !== '')
		.map(
			([k, v]) =>
				`<tr><td style="padding:6px 12px 6px 0;color:#5A5750;font-size:13px;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;font-size:14px">${esc(v).replace(/\n/g, '<br>')}</td></tr>`
		)
		.join('');
	return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">${tr}</table>`;
}

export const emailParagraph = (text: string) => `<p style="font-size:15px;line-height:1.6;margin:0 0 14px">${esc(text)}</p>`;
export const emailButton = (label: string, href: string) =>
	`<p style="margin:24px 0"><a href="${esc(href)}" style="background:#F2D200;color:#0B0D0C;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">${esc(label)}</a></p>`;
