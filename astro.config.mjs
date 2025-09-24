import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

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
  }), sitemap(), tailwind()],
  prefetch: {
    prefetchAll: true,
  },
});
