# CLAUDE.md

Astro-based personal website with pure Org-mode integration, following Dieter Rams design philosophy.

## Commands

- `npm run dev` - Development server
- `npm run build` - Build with TypeScript checking
- `npm run deploy` - Deploy to Cloudflare Workers

## Architecture

- Pure Org-mode integration (`src/lib/astro-org.ts`)
- Content stored as `.org` files with simple naming convention
- Dynamic routing via `src/pages/content/[...slug].astro`
- Tag-based filtering at `/content/`
- Org-mode link resolution with `[[filename]]` syntax
- Backlink generation for cross-referenced content
- Cloudflare Workers deployment

## Design Philosophy

**Dieter Rams' "Good Design" Principles:**
1. **Good design is innovative** - Custom Org-mode integration for unique workflow
2. **Good design makes a product useful** - Clear navigation, fast loading, readable typography
3. **Good design is aesthetic** - Minimal color palette, system fonts, purposeful spacing
4. **Good design makes a product understandable** - Intuitive structure, semantic HTML
5. **Good design is unobtrusive** - Content-first approach, no visual clutter
6. **Good design is honest** - Authentic personal content, no artificial engagement tricks
7. **Good design is long-lasting** - Timeless typography, semantic markup, accessibility
8. **Good design is thorough down to the last detail** - 100% Lighthouse scores, perfect contrast ratios
9. **Good design is environmentally friendly** - Minimal JavaScript, efficient caching, static generation
10. **Good design is as little design as possible** - **"Less but better"** - Essential elements only

## Standards

- **Accessibility**: 100% Lighthouse accessibility score required
- **Performance**: 99%+ Lighthouse performance score target
- **Colors**: Minimal palette with WCAG AA contrast ratios (4.5:1+)
- **Typography**: System fonts for performance and consistency
- **Links**: Subtle borders for distinction without visual noise