import 'dotenv/config';
import path from 'node:path';
import type { DB } from '../../src/lib/server/db/client';
import { createS3Storage, type ObjectStorage } from '../../src/lib/server/storage';
import { createDevStorage } from './dev-storage';

/** CLI connection: Neon when DATABASE_URL is set, otherwise the local PGlite database. */
export async function connect(): Promise<{ db: DB; storage: ObjectStorage; close: () => Promise<void>; target: string }> {
	const storage = process.env.STORAGE_ENDPOINT
		? createS3Storage({
				endpoint: process.env.STORAGE_ENDPOINT,
				bucket: process.env.STORAGE_BUCKET || 'othalan-media',
				region: process.env.STORAGE_REGION || 'us-east-2',
				accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? '',
				secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? ''
			})
		: createDevStorage();

	if (process.env.DATABASE_URL) {
		const { neon } = await import('@neondatabase/serverless');
		const { drizzle } = await import('drizzle-orm/neon-http');
		const { migrate } = await import('drizzle-orm/neon-http/migrator');
		const schema = await import('../../src/lib/server/db/schema');
		const db = drizzle({ client: neon(process.env.DATABASE_URL), schema, casing: 'snake_case' });
		await migrate(db, { migrationsFolder: path.resolve('drizzle') });
		return { db: db as unknown as DB, storage, close: async () => {}, target: 'Neon' };
	}
	const { openPglite } = await import('./pglite');
	const { db, client } = await openPglite();
	return { db: db as unknown as DB, storage, close: () => client.close(), target: 'PGlite (.data/pglite)' };
}
