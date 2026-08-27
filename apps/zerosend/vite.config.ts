import { fileURLToPath } from 'node:url';

import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    viteReact(),
  ],
  resolve: {
    // Explicit alias: Vite's built-in tsconfigPaths can miss @/ during dependency
    // pre-bundling when TanStack Router uses virtual module IDs (see vite#21889).
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    tsconfigPaths: true,
  },
  server: {
    port: 3001,
  },
});
