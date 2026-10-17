import { mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import type { ObjectStorage } from '../../src/lib/server/storage';

/** Filesystem object store for local development (.data/storage). */
export function createDevStorage(root = path.resolve('.data/storage')): ObjectStorage {
	const file = (key: string) => {
		const p = path.resolve(root, key);
		if (!p.startsWith(root)) throw new Error('invalid key');
		return p;
	};
	return {
		async put(key, body, contentType) {
			const p = file(key);
			await mkdir(path.dirname(p), { recursive: true });
			await writeFile(p, body instanceof Uint8Array ? body : new Uint8Array(body));
			await writeFile(p + '.meta', JSON.stringify({ contentType }));
		},
		async get(key) {
			const p = file(key);
			try {
				const [buf, meta, st] = await Promise.all([readFile(p), readFile(p + '.meta', 'utf8').catch(() => '{}'), stat(p)]);
				return {
					body: new Uint8Array(buf),
					contentType: JSON.parse(meta).contentType ?? 'application/octet-stream',
					size: st.size,
					etag: `"${st.mtimeMs.toString(36)}"`
				};
			} catch {
				return null;
			}
		},
		async delete(key) {
			await rm(file(key), { force: true });
			await rm(file(key) + '.meta', { force: true });
		}
	};
}
