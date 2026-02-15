import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://amudar.io',
  i18n: {
    defaultLocale: 'uz',
    locales: ['en', 'uz', 'ru'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  build: {
    assets: 'assets',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
