import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'cron-timezone-convert',
      fileName: 'cron-timezone-convert',
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})