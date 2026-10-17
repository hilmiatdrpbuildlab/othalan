import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export const createNeonDb = (url: string) => drizzle({ client: neon(url), schema, casing: 'snake_case' });

/** Shared database type. The dev PGlite instance is API-compatible for everything the app uses. */
export type DB = ReturnType<typeof createNeonDb>;

declare global {
	var __othalanDevDb: unknown;
}

/**
 * One client per request in production (Neon HTTP driver is stateless and cheap to create).
 * In local dev without DATABASE_URL, the Vite plugin provides an embedded PGlite database.
 */
export function getDb(url: string | undefined): DB {
	if (url) return createNeonDb(url);
	if (globalThis.__othalanDevDb) return globalThis.__othalanDevDb as DB;
	throw new Error('DATABASE_URL no está configurada.');
}
