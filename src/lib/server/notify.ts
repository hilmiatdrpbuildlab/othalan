import { env as publicEnv } from '$env/dynamic/public';
import type { SiteSettings } from '$lib/site-config';
import { emailButton, emailLayout, emailParagraph, emailTable, sendEmail } from './email';

type Kind = 'rfq' | 'contact' | 'jobs' | 'suppliers' | 'reports';

/** Internal notification to the recipients configured in CMS → Configuración (falls back to the main email). */
export async function notifyTeam(
	settings: SiteSettings,
	kind: Kind,
	opts: { subject: string; title: string; rows: [string, unknown][]; adminPath: string; replyTo?: string }
) {
	const to = settings.notify[kind] || settings.email;
	if (!to) return;
	const site = (publicEnv.PUBLIC_SITE_URL || '').replace(/\/$/, '');
	await sendEmail({
		to,
		subject: opts.subject,
		replyTo: opts.replyTo,
		html: emailLayout(opts.title, emailTable(opts.rows) + emailButton('Ver en el panel', `${site}${opts.adminPath}`))
	});
}

/** Confirmation to the person who submitted the form. */
export async function confirmToSender(settings: SiteSettings, to: string, subject: string, title: string, paragraphs: string[]) {
	await sendEmail({
		to,
		subject,
		replyTo: settings.email || undefined,
		html: emailLayout(title, paragraphs.map(emailParagraph).join('') + emailParagraph(`— Equipo ${settings.companyName}`))
	});
}
