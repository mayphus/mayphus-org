import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import VitePWA from '@vite-pwa/astro';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';

import org from './src/lib/astro-org';
import { customHeadline } from './src/lib/plugins/headline';
import siteConfigs from './sites.config.json' assert { type: 'json' };

const siteKey = process.env.SITE_KEY ?? process.env.PUBLIC_SITE_KEY ?? 'mayphus';
const activeSite = siteConfigs[siteKey];

if (!activeSite) {
  throw new Error(`Site configuration for "${siteKey}" was not found. Set SITE_KEY to one of: ${Object.keys(siteConfigs).join(', ')}`);
}

const manifestThemeColor = '#0f172a';
const manifest = {
  name: activeSite.title,
  short_name: activeSite.title,
  description: activeSite.description,
  start_url: '/',
  scope: '/',
  display: 'standalone',
  lang: 'en',
  id: '/',
  background_color: '#ffffff',
  theme_color: manifestThemeColor,
  icons: [
    {
      src: '/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
  ],
};

// https://astro.build/config
export default defineConfig({
  site: activeSite.site,
  integrations: [org({
    uniorgPlugins: [
      customHeadline,
    ],
    rehypePlugins: [
      [rehypeAutolinkHeadings, {
        behavior: 'wrap',
      }],
      [rehypeShiki, {
        themes: {
          light: 'solarized-light',
          dark: 'solarized-dark',
        },
      }],
    ],
  }), sitemap(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg'],
    manifest,
    workbox: {
      // NOTE: workbox-build@7 fails when its terser step runs under pnpm + rollup.
      // Keeping the mode set to 'development' skips that minification pass so
      // `pnpm run build` completes. Switch back to 'production' once the
      // upstream issue is addressed.
      mode: 'development',
      globPatterns: [
        '**/*.{js,css,html,ico,png,svg,webp,woff2,woff,ttf}',
      ],
      navigateFallback: '/',
    },
    devOptions: {
      enabled: true,
    },
  })],
  prefetch: {
    prefetchAll: true,
  },
});
