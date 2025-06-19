import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';

import org from './src/lib/astro-org';
import { processFrontmatter } from './src/lib/plugins/frontmatter';
import { customHeadline } from './src/lib/plugins/headline';
import { resolveDenotLinks } from './src/lib/plugins/denote-links';
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
            resolveDenotLinks,
            [rehypeAutolinkHeadings, { 
                behavior: 'wrap',
            }],
            [rehypeShiki, {
                themes: {
                    light: 'solarized-light',
                    dark: 'solarized-dark',
                },
            }],
            addBackLinks,
        ],
    }), sitemap()],
    prefetch: {
        prefetchAll: true,
    },
});