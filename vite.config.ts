import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * Local development backends.
 * When DATABASE_URL / STORAGE_ENDPOINT are empty, the dev server provides an embedded PGlite database
 * (.data/pglite, migrated + seeded automatically) and a filesystem object store (.data/storage).
 * They are attached to globalThis so the app bundle never imports PGlite or node:fs —
 * the Cloudflare Workers build stays clean.
 */
function othalanDevBackends(): Plugin {
	return {
		name: 'othalan-dev-backends',
		apply: 'serve',
		async configureServer() {
			const env = loadEnv('development', process.cwd(), '');
			const { createDevStorage } = await import('./scripts/lib/dev-storage');
			if (!env.STORAGE_ENDPOINT) {
				globalThis.__othalanDevStorage = createDevStorage();
				console.log('[othalan] storage: local filesystem (.data/storage)');
			}
			if (!env.DATABASE_URL) {
				const { openPglite } = await import('./scripts/lib/pglite');
				const { db, seeded } = await openPglite({ seedIfEmpty: true, storage: globalThis.__othalanDevStorage });
				globalThis.__othalanDevDb = db;
				console.log(`[othalan] database: PGlite (.data/pglite)${seeded ? ' — seeded with initial content' : ''}`);
			}
		}
	};
}

export default defineConfig({
	plugins: [othalanDevBackends(), sveltekit()],
	server: { fs: { allow: ['assets'] } }
});
