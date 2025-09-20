import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';

import org from './src/lib/astro-org';
import { customHeadline } from './src/lib/plugins/headline';

// https://astro.build/config
export default defineConfig({
  site: 'https://mayphus.org',
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
