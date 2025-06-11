# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Development and build commands:
- `npm run dev` - Start local development server (http://localhost:4321)
- `npm run build` - Build the site (includes TypeScript checking via astro check)
- `npm run preview` - Preview the built site locally
- `npm run deploy` - Build and deploy to Cloudflare Workers
- `npm run dev:wrangler` - Local development with Wrangler

Quality checks:
- `astro check` - TypeScript type checking (included in build command)

## Architecture

This is an Astro-based personal website that uses a custom Org-mode integration to publish Emacs Org files as web content.

### Core Components

**Org-mode Integration (`src/lib/astro-org.ts`)**
- Custom Astro integration that processes `.org` files using uniorg
- Converts Org-mode files to JSX components via rollup-plugin-orgx
- Extracts frontmatter from Org-mode keywords (title, date, filetags, etc.)
- Located in `src/lib/astro-org.ts` with plugins in `src/lib/plugins/`

**Content System**
- All content stored as `.org` files in `/content/` directory
- Each file follows naming pattern: `YYYYMMDDTHHMMSS--title__tags.org`
- Content collection defined in `src/content.config.ts` with schema validation
- Dynamic routing handles both regular pages and content collection items

**Custom Plugins**
- `src/lib/plugins/keyword.ts` - Processes Org-mode keywords
- `src/lib/plugins/headline.ts` - Handles Org-mode headlines
- Plugins extend uniorg processing pipeline

### Deployment

- Deployed to Cloudflare Workers (migrated from Pages)
- Build outputs to `./dist` directory
- Wrangler configuration in `wrangler.jsonc`
- Static assets served from `./dist` with 404-page handling

### Content Structure

Content is organized by date-based filenames with tags, covering topics like:
- Technology notes (emacs, linux, programming languages)
- Electronics projects (esp32, raspberry pi, pcb design)
- Articles and personal reflections
- Project documentation