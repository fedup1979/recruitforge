// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sentry from '@sentry/astro';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ambitia.io',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/dashboard') &&
        !page.includes('/profile') &&
        !page.includes('/apply') &&
        !page.includes('/test/') &&
        !page.includes('/tests') &&
        !page.includes('/confirm-email'),
    }),
    sentry({
      sourceMapsUploadOptions: {
        enabled: false,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});