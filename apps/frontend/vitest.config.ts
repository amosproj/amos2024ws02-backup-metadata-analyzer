import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(({ mode }) => {
  return {
  plugins: [angular({tsconfig: './apps/frontend/tsconfig.spec.json'}), nxViteTsPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/test-setup.ts',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    alias: {
      '@app': resolve(__dirname, 'src/app'),
      '@environments': resolve(__dirname, 'src/environments'),
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  },
}});

