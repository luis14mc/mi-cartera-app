import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    AstroPWA({
      mode: 'production',
      base: '/',
      scope: '/',
      includeAssets: ['favicon.svg'],
      registerType: 'autoUpdate',
      manifest: {
        name: 'Control CRONOS',
        short_name: 'CRONOS',
        description: 'PWA de disciplina financiera estricta y bloqueos duros anti-fugas de gasto',
        theme_color: '#1a73e8',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/',
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
