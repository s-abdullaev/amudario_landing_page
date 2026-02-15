import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://amudar.io',
  build: {
    assets: 'assets',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
