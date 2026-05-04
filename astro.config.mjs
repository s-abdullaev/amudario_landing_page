import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://amudar.io',
  integrations: [sitemap({
    i18n: {
      defaultLocale: 'en',
      locales: {
        en: 'en-US',
        uz: 'uz-UZ',
        ru: 'ru-RU',
      },
    },
  })],
  i18n: {
    defaultLocale: 'en',
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
