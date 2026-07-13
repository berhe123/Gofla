/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = (env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
  const useProxy = env.VITE_USE_API_PROXY === 'true' || !env.VITE_API_URL;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: useProxy
        ? {
            '/api': { target: apiTarget, changeOrigin: true },
            '/uploads': { target: apiTarget, changeOrigin: true },
          }
        : undefined,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: false,
    },
  };
});
