# CLAUDE.md

Astro-based personal website with custom Org-mode integration.

## Commands

- `npm run dev` - Development server
- `npm run build` - Build with TypeScript checking
- `npm run deploy` - Deploy to Cloudflare Workers

## Architecture

- Custom Org-mode integration (`src/lib/astro-org.ts`)
- Content stored as `.org` files with Denote convention
- Dynamic routing via `src/pages/content/[...slug].astro`
- Tag-based filtering at `/content/`
- Cloudflare Workers deployment