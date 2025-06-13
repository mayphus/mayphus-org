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

### Core Features & Components

**Custom Org-mode Integration (`src/lib/astro-org.ts`)**
- Custom Astro integration that processes `.org` files using uniorg
- Converts Org-mode files to JSX components via rollup-plugin-orgx
- Extracts frontmatter from Org-mode keywords (title, date, filetags, etc.)
- Denote convention support with automatic slug generation
- Cross-linking system with `denote:` ID resolution

**Content Management System**
- All content stored as `.org` files in `/content/` directory
- Denote filename pattern: `YYYYMMDDTHHMMSS--title__tags.org`
- Content collection with Zod schema validation (`src/content.config.ts`)
- Automatic classification into articles, projects, and notes based on tags
- Dynamic routing for flexible URL structure (`src/pages/[...path].astro`)

**Custom Processing Plugins**
- `src/lib/plugins/keyword.ts` - Processes Org-mode keywords and dates
- `src/lib/plugins/headline.ts` - Adjusts heading levels for semantic HTML
- Rehype plugins for autolink headings and ID link resolution
- Extensible plugin architecture for content processing

**Performance Optimizations**
- Lazy-loaded syntax highlighting with Intersection Observer
- Optimized font loading with CSS layers and preconnect hints
- Async Google Analytics with requestIdleCallback
- Built-in Astro prefetching for instant navigation
- Edge deployment via Cloudflare Workers

**Code Highlighting System**
- Highlight.js integration with dynamic language loading
- Support for JavaScript, Python, Bash, CSS, Lisp, Emacs Lisp
- GitHub light/dark themes with custom styling
- Performance-optimized loading only when code blocks are visible

**Design & Accessibility Features**
- Responsive design with mobile-first approach
- Dark mode support via CSS media queries
- Typography system: Source Serif Pro, Source Sans Pro, JetBrains Mono
- Accessibility: skip links, focus management, WCAG compliance
- Print optimization with academic paper formatting

**SEO & Social Integration**
- RSS feed generation with full content
- Automatic sitemap generation
- Open Graph and Twitter Card metadata
- JSON-LD structured data for Person schema
- Canonical URL handling

### Deployment

- **Cloudflare Workers** deployment (migrated from Pages)
- Build outputs to `./dist` directory with optimized assets
- Wrangler configuration in `wrangler.jsonc`
- Static asset serving with proper caching and 404 handling
- Edge performance with global CDN distribution

### Content Structure & Organization

**Content Classification**
- **Articles**: In-depth explorations and tutorials (tagged with `article`)
- **Projects**: Hardware, software, and creative builds (tagged with `project`)
- **Notes**: Quick ideas, references, and learning logs (all other content)

**Content Organization**
- Date-based chronological organization
- Tag-based filtering and classification
- Cross-linking via Denote ID system
- Month/year grouped navigation
- Personal knowledge base bridging private notes and public content

**Content Topics**
- Technology notes (emacs, linux, programming languages)
- Electronics projects (esp32, raspberry pi, pcb design)
- 3D printing and maker projects
- Software development and tools
- Personal reflections and learning logs