import { URL, fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // only need to support browser versions with WebGPU support
    target: ['chrome113', 'edge113', 'firefox141', 'safari26'],
  },
  base: process.env.VITE_BASE_PATH || undefined,
  plugins: [viteReact(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
});
