// Usage: npm run user:create -- <email> <role: admin|editor|comercial|rrhh> "<Nombre>" [password]
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { connect } from './lib/connect';
import { users } from '../src/lib/server/db/schema';
import { hashPassword } from '../src/lib/server/auth';

const [email, role = 'editor', name = 'Usuario', given] = process.argv.slice(2);
if (!email || !['admin', 'editor', 'comercial', 'rrhh'].includes(role)) {
	console.error('Uso: npm run user:create -- <email> <admin|editor|comercial|rrhh> "<Nombre>" [contraseña]');
	process.exit(1);
}
const password = given || randomBytes(9).toString('base64url') + '7a';
const { db, close } = await connect();
const passwordHash = await hashPassword(password);
const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
if (existing) {
	await db.update(users).set({ passwordHash, role: role as 'admin', name, active: true }).where(eq(users.id, existing.id));
	console.log(`✓ updated ${email}`);
} else {
	await db.insert(users).values({ email: email.toLowerCase(), role: role as 'admin', name, passwordHash });
	console.log(`✓ created ${email}`);
}
if (!given) console.log(`  temporary password: ${password}`);
await close();
