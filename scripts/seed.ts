// Seeds initial content + first admin user. Refuses to run twice.
import { sql } from 'drizzle-orm';
import { connect } from './lib/connect';
import { seed } from './lib/seed-data';

const { db, storage, close, target } = await connect();
const res = await db.execute(sql`select count(*)::int as n from site_settings`);
const n = Number((res as unknown as { rows: { n: number }[] }).rows[0].n);
if (n > 0) {
	console.log(`Database on ${target} already has content — seed skipped.`);
} else {
	await seed(db, storage);
	console.log(`✓ seeded ${target}`);
}
await close();
