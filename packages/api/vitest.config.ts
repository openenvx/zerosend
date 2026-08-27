import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    dedupe: ['zod'],
  },
  test: {
    server: {
      deps: {
        inline: ['zod'],
      },
    },
  },
});
