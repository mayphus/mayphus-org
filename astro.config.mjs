import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';

import org from './src/lib/astro-org';
import { customKeywords } from './src/lib/plugins/keyword';
import { customHeadline } from './src/lib/plugins/headline';
import { resolveIdLinks } from './src/lib/plugins/id-link';
import { addBackLinks } from './src/lib/plugins/backlinks';

// https://astro.build/config
export default defineConfig({
    site: 'https://mayphus.org',
    integrations: [org({
        uniorgPlugins: [
            customKeywords,
            customHeadline,
        ],
        rehypePlugins: [
            resolveIdLinks,
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
    }), sitemap(), pagefind()],
    markdown: {
        syntaxHighlight: 'shiki',
        shikiConfig: {
            theme: 'solarized-light',
            themes: {
                light: 'solarized-light',
                dark: 'solarized-dark',
            },
            wrap: true,
        },
    },
    prefetch: {
        prefetchAll: true,
    },
});