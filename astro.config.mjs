import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';

import org from './src/lib/astro-org';
import { processFrontmatter } from './src/lib/plugins/frontmatter';
import { customHeadline } from './src/lib/plugins/headline';
import { resolveOrgLinks } from './src/lib/plugins/org-links';
import { addBackLinks } from './src/lib/plugins/backlinks';

// https://astro.build/config
export default defineConfig({
  site: 'https://mayphus.org',
  integrations: [org({
    uniorgPlugins: [
      processFrontmatter,
      customHeadline,
    ],
    rehypePlugins: [
      resolveOrgLinks,
      [rehypeAutolinkHeadings, { 
        behavior: 'wrap',
      }],
      [rehypeShiki, {
        themes: {
          light: 'min-light',
          dark: 'min-dark',
        },
      }],
      addBackLinks,
    ],
  }), sitemap()],
  prefetch: {
    prefetchAll: true,
  },
});