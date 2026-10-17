import { AwsClient } from 'aws4fetch';

export interface StoredObject {
	body: ReadableStream | Uint8Array;
	contentType: string;
	size?: number;
	etag?: string | null;
}

export interface ObjectStorage {
	put(key: string, body: Uint8Array | ArrayBuffer, contentType: string): Promise<void>;
	get(key: string): Promise<StoredObject | null>;
	delete(key: string): Promise<void>;
}

export interface S3Config {
	endpoint: string;
	bucket: string;
	region: string;
	accessKeyId: string;
	secretAccessKey: string;
}

/**
 * S3-compatible storage via aws4fetch (fetch-based, runs on Workers).
 * Neon Object Storage only supports path-style addressing: {endpoint}/{bucket}/{key}.
 */
export function createS3Storage(cfg: S3Config): ObjectStorage {
	const client = new AwsClient({
		accessKeyId: cfg.accessKeyId,
		secretAccessKey: cfg.secretAccessKey,
		service: 's3',
		region: cfg.region
	});
	const base = cfg.endpoint.replace(/\/+$/, '');
	const url = (key: string) => `${base}/${cfg.bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;

	return {
		async put(key, body, contentType) {
			const res = await client.fetch(url(key), {
				method: 'PUT',
				body: (body instanceof Uint8Array ? body : new Uint8Array(body)) as unknown as BodyInit,
				headers: { 'content-type': contentType }
			});
			if (!res.ok) throw new Error(`Storage PUT ${res.status}: ${await res.text()}`);
		},
		async get(key) {
			const res = await client.fetch(url(key));
			if (res.status === 404 || res.status === 403) return null;
			if (!res.ok || !res.body) throw new Error(`Storage GET ${res.status}`);
			return {
				body: res.body,
				contentType: res.headers.get('content-type') ?? 'application/octet-stream',
				size: Number(res.headers.get('content-length')) || undefined,
				etag: res.headers.get('etag')
			};
		},
		async delete(key) {
			const res = await client.fetch(url(key), { method: 'DELETE' });
			if (!res.ok && res.status !== 404) throw new Error(`Storage DELETE ${res.status}`);
		}
	};
}

declare global {
	var __othalanDevStorage: ObjectStorage | undefined;
}

type StorageEnv = Record<string, string | undefined>;

export function getStorage(env: StorageEnv): ObjectStorage {
	if (env.STORAGE_ENDPOINT) {
		return createS3Storage({
			endpoint: env.STORAGE_ENDPOINT,
			bucket: env.STORAGE_BUCKET || 'othalan-media',
			region: env.STORAGE_REGION || 'us-east-2',
			accessKeyId: env.STORAGE_ACCESS_KEY_ID ?? '',
			secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY ?? ''
		});
	}
	if (globalThis.__othalanDevStorage) return globalThis.__othalanDevStorage;
	throw new Error('El almacenamiento de objetos no está configurado (STORAGE_ENDPOINT).');
}

/** Storage key helpers. Public objects are served by /media/*, private ones only through the CMS. */
export function publicKey(ext: string) {
	const d = new Date();
	const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
	return `public/media/${d.getUTCFullYear()}/${mm}/${crypto.randomUUID()}.${ext}`;
}

export function privateKey(folder: 'rfq' | 'cv' | 'suppliers', parent: string, filename: string) {
	const safe = filename
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-zA-Z0-9._-]+/g, '-')
		.slice(-80);
	return `private/${folder}/${parent}/${crypto.randomUUID().slice(0, 8)}-${safe}`;
}
