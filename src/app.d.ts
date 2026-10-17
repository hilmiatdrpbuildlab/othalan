import type { DB } from '$lib/server/db/client';
import type { SessionUser } from '$lib/server/auth';

declare global {
	namespace App {
		interface Locals {
			db: DB;
			user: SessionUser | null;
		}
		interface Error {
			message: string;
		}
		interface Platform {
			env?: {
				FORM_LIMITER?: { limit(opts: { key: string }): Promise<{ success: boolean }> };
				[key: string]: unknown;
			};
			context?: ExecutionContext;
			caches?: CacheStorage & { default: Cache };
		}
	}
}

export {};
