import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { and, gte, inArray, isNotNull, lt, lte } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { purgeExpiredSessions } from '$lib/server/auth';
import { getSettings } from '$lib/server/content';
import * as t from '$lib/server/db/schema';
import { emailButton, emailLayout, emailTable, sendEmail } from '$lib/server/email';
import { getStorage } from '$lib/server/storage';
import { formatDate } from '$lib/utils/format';

const YEAR = 365 * 864e5;

/**
 * Maintenance tasks. Call daily (e.g. GitHub Actions schedule or a Cloudflare Cron Trigger worker):
 *   curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://www.othalan.cl/api/cron
 * - removes expired sessions
 * - data retention per the privacy policy: RFQs 3 years, contact messages 2 years, job applications (CV) 1 year
 * - on Mondays, emails a digest of certifications expiring within 30 days
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${env.CRON_SECRET}`) error(401, 'No autorizado');
	const db = locals.db;
	const storage = getStorage(env);
	const now = Date.now();
	const report: Record<string, number> = {};

	await purgeExpiredSessions(db);

	// RFQs older than 3 years (+ attachments)
	const oldRfq = await db.select({ id: t.rfqRequests.id }).from(t.rfqRequests).where(lt(t.rfqRequests.createdAt, new Date(now - 3 * YEAR)));
	if (oldRfq.length) {
		const ids = oldRfq.map((r) => r.id);
		const files = await db.select({ key: t.rfqFiles.storageKey }).from(t.rfqFiles).where(inArray(t.rfqFiles.rfqId, ids));
		await Promise.all(files.map((f) => storage.delete(f.key).catch(() => {})));
		await db.delete(t.rfqRequests).where(inArray(t.rfqRequests.id, ids));
	}
	report.rfq = oldRfq.length;

	const msgs = await db.delete(t.contactMessages).where(lt(t.contactMessages.createdAt, new Date(now - 2 * YEAR))).returning({ id: t.contactMessages.id });
	report.contact = msgs.length;

	const apps = await db
		.delete(t.jobApplications)
		.where(lt(t.jobApplications.createdAt, new Date(now - YEAR)))
		.returning({ cvKey: t.jobApplications.cvKey });
	await Promise.all(apps.filter((a) => a.cvKey).map((a) => storage.delete(a.cvKey!).catch(() => {})));
	report.applications = apps.length;

	// Weekly certification expiry digest
	if (new Date().getUTCDay() === 1) {
		const today = new Date().toISOString().slice(0, 10);
		const in30 = new Date(now + 30 * 864e5).toISOString().slice(0, 10);
		const expiring = await db
			.select({ name: t.certifications.name, expiresAt: t.certifications.expiresAt })
			.from(t.certifications)
			.where(and(isNotNull(t.certifications.expiresAt), gte(t.certifications.expiresAt, today), lte(t.certifications.expiresAt, in30)));
		if (expiring.length) {
			const settings = await getSettings(db);
			const site = (publicEnv.PUBLIC_SITE_URL || '').replace(/\/$/, '');
			await sendEmail({
				to: settings.notify.rfq || settings.email,
				subject: `${expiring.length} certificación(es) por vencer`,
				html: emailLayout(
					'Certificaciones por vencer',
					emailTable(expiring.map((c) => [c.name, `Vence el ${formatDate(c.expiresAt)}`])) + emailButton('Actualizar en el panel', `${site}/admin/c/certificaciones`)
				)
			});
		}
		report.certReminders = expiring.length;
	}

	return json({ ok: true, ...report });
};
