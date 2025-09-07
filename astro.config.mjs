import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import org from './src/lib/astro-org';
import { processFrontmatter } from './src/lib/plugins/frontmatter';
import { customHeadline } from './src/lib/plugins/headline';
import { resolveOrgLinks } from './src/lib/plugins/org-links';
import { addBackLinks } from './src/lib/plugins/backlinks';
import { codeBlock } from './src/lib/plugins/code-block';

// https://astro.build/config
export default defineConfig({
  site: 'https://mayphus.org',
  integrations: [react(), org({
    uniorgPlugins: [
      processFrontmatter,
      customHeadline,
    ],
    rehypePlugins: [
      resolveOrgLinks,
      [rehypeAutolinkHeadings, { 
        behavior: 'wrap',
      }],
      codeBlock,
      addBackLinks,
    ],
  }), sitemap(), tailwind()],
  prefetch: {
    prefetchAll: true,
  },
});
