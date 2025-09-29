import type { APIRoute } from 'astro';

import { SITE_CONFIG } from '../lib/site';

const sitemapUrl = new URL('/sitemap-index.xml', SITE_CONFIG.site).toString();

const body = [
  'User-agent: *',
  'Allow: /',
  `Sitemap: ${sitemapUrl}`,
].join('\n').concat('\n');

export const prerender = true;

export const GET: APIRoute = () => new globalThis.Response(body, {
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=0, must-revalidate',
  },
});
