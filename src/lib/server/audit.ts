import type { DB } from './db/client';
import { auditLog } from './db/schema';
import type { SessionUser } from './auth';

export async function audit(
	db: DB,
	user: SessionUser | null | undefined,
	action: 'create' | 'update' | 'delete' | 'publish' | 'login' | 'logout' | 'restore' | 'status' | 'export' | 'upload',
	entity: string,
	entityId?: string | null,
	summary?: string
) {
	try {
		await db.insert(auditLog).values({
			userId: user?.id ?? null,
			userName: user ? `${user.name} <${user.email}>` : null,
			action,
			entity,
			entityId: entityId ?? null,
			summary: summary?.slice(0, 500) ?? null
		});
	} catch (e) {
		console.error('[audit] failed', e);
	}
}
