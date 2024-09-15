import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import org from 'astro-org';
import { config } from './src/lib/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://felixmurraytang.com',
	integrations: [
		org(config),
		sitemap(),
	],
});