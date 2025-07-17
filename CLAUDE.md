# Commands
- `npm run dev` - Development server
- `npm run validate` - test all

# Architecture
- Pure Org-mode integration (`src/lib/astro-org.ts`)
- Content stored as `.org` files with simple naming convention
- Dynamic routing via `src/pages/content/[...slug].astro`
- Tag-based filtering at `/content/`
- Org-mode link resolution with `[[filename]]` syntax
- Backlink generation for cross-referenced content
- Cloudflare Workers deployment
