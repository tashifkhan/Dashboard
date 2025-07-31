// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://tashif.codes/', // <-- Top-level, not inside sitemap()
  output: 'server',              // Enable server-side rendering for API routes
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    react(),
    sitemap()
  ],
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});