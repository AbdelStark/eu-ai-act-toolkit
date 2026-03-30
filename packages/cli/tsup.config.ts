import { defineConfig } from 'tsup';
import { resolve } from 'node:path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  noExternal: ['@eu-ai-act/sdk'],
  esbuildOptions(options) {
    // Resolve SDK from source so dev watch mode doesn't race with SDK's clean
    options.alias = {
      '@eu-ai-act/sdk': resolve(__dirname, '../sdk/src/index.ts'),
      '@data': resolve(__dirname, '../../data'),
    };
  },
  loader: {
    '.json': 'json',
  },
});
