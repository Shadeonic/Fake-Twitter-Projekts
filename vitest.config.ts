import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, 'client/src/setupTests.ts'),
    include: ['client/src/**/*.test.{ts,tsx}'], // тесты из client
  },
});
