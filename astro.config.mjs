import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import org from './src/lib/astro-org';
import { customKeywords } from './src/lib/plugins/keyword';
import { customHeadline } from './src/lib/plugins/headline';
import { replaceDenoteLinks } from './src/lib/plugins/link';
// https://astro.build/config
export default defineConfig({
	site: 'https://felixmurraytang.com',
	integrations: [
		org({
			uniorgPlugins: [
				customKeywords,
				customHeadline,
				replaceDenoteLinks,
			],
		}),
		sitemap(),
	],
});