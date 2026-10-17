import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	resolve: {
		alias: {
			$lib: path.resolve('src/lib'),
			'$env/dynamic/public': path.resolve('src/lib/server/__mocks__/env.ts'),
			'$env/dynamic/private': path.resolve('src/lib/server/__mocks__/env.ts')
		}
	},
	test: { include: ['src/**/*.test.ts'], environment: 'node' }
});
