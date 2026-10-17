import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { sql } from 'drizzle-orm';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import * as schema from '../../src/lib/server/db/schema';
import type { ObjectStorage } from '../../src/lib/server/storage';

/** Opens (and migrates) the embedded dev database. Optionally seeds it on first run. */
export async function openPglite(opts: { seedIfEmpty?: boolean; storage?: ObjectStorage } = {}) {
	mkdirSync(path.resolve('.data'), { recursive: true });
	const client = new PGlite(path.resolve('.data/pglite'));
	const db = drizzle({ client, schema, casing: 'snake_case' });
	await migrate(db, { migrationsFolder: path.resolve('drizzle') });
	let seeded = false;
	if (opts.seedIfEmpty && opts.storage) {
		const res = await db.execute(sql`select count(*)::int as n from site_settings`);
		const n = (res.rows[0] as { n: number }).n;
		if (n === 0) {
			const { seed } = await import('./seed-data');
			await seed(db as never, opts.storage);
			seeded = true;
		}
	}
	return { db, client, seeded };
}
