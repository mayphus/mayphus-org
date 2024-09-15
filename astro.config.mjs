import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import org from 'astro-org';
import { customKeywordsToFrontmatter } from './src/lib/keywords';

// https://astro.build/config
export default defineConfig({
	site: 'https://felixmurraytang.com',
	integrations: [
		org({
			uniorgPlugins: [customKeywordsToFrontmatter],
		}),
		sitemap(),
	],
});