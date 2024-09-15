import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';

import org from './src/lib/astro-org';
import { customKeywords } from './src/lib/plugins/keyword';
import { customHeadline } from './src/lib/plugins/headline';

// https://astro.build/config
export default defineConfig({
	site: 'https://mayphus.org',
	integrations: [
		org({
			uniorgPlugins: [
				customKeywords,
				customHeadline,
			],
			rehypePlugins: [
				[rehypeAutolinkHeadings, { 
					behavior: 'wrap',
				}],
				rehypeHighlight,
			],
		}),
		sitemap(),
	],
	prefetch: {
		prefetchAll: true,
	},
});
