// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sentry from '@sentry/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://ambitia.io',
  integrations: [
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