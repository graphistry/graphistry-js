import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import consoleForward from 'vite-plugin-console-forward';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Forwards browser console.* and unhandled errors to this dev-server's
    // stdout, so coding agents editing on the server can see runtime
    // behavior without needing browser devtools on the Mac.
    consoleForward({
      levels: ['error', 'warn', 'info', 'log', 'debug'],
      unhandledErrors: true,
    }),
  ],
  resolve: {
    alias: {
      '@graphistry/client-api-context': resolve(__dirname, '../client-api-context/src/index.ts'),
      '@graphistry/client-api': resolve(__dirname, '../client-api/src/index.js'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    allowedHosts: ['.ts.net', 'localhost', '127.0.0.1'],
    hmr: {
      clientPort: 8493,
      protocol: 'wss',
    },
  },
});
