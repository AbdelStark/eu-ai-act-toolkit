import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@data': resolve(__dirname, '../../data'),
    },
  },
  test: {
    include: ['src/__tests__/**/*.test.ts'],
  },
});
