# mayphus.org

Personal knowledge garden and publication pipeline built with Astro and a custom Org-mode integration.

## Features
- Astro integration (`src/lib/astro-org.ts`) that understands Org-mode keywords, generates frontmatter, and exposes content through the standard `astro:content` APIs.
- Automatic backlink section appended to each page, built from intra-site link analysis and cached for fast rebuilds.
- Robust link resolution for `[[link]]` and `[[file:path/to/file.org][Label]]` syntax, including nested directories and relative paths such as `[[../notes/linux]]`.
- Tag-based filtering UI on `/content/`, plus RSS feed, sitemap, Tailwind typography, and syntax-highlighted code blocks.
- Cloudflare Workers deployment via `wrangler` with local fallbacks to mirror production behavior during development.

## Getting Started
### Prerequisites
- Node.js 20+
- pnpm 10+

### Install dependencies
```bash
pnpm install
```

### Local development
```bash
pnpm run dev
```
The command launches the Astro dev server, processes Org files on the fly, and regenerates backlinks/link targets as you edit content.

### Build & preview
```bash
pnpm run build
pnpm run preview
```
`build` runs `astro check` and produces the static site in `dist/`. Use `preview` to verify the production bundle locally.

### Deploy
```bash
pnpm run deploy
```
Runs the production build and publishes to Cloudflare Workers via `wrangler`.

## Content Authoring
- Place `.org` files in the `content/` directory. Subdirectories are supported; their relative paths are used when resolving links.
- Org keywords (`#+title:`, `#+description:`, `#+date:`, `#+filetags:`) are extracted into frontmatter automatically. Dates expressed as `[YYYY-MM-DD Day HH:MM]` are converted to `Date` objects.
- Use `filetags` to drive the homepage “Projects/Articles” sections and the tag filter on `/content/`.
- Cross-link entries with Org syntax. Examples:
  - `[[raspberry-pi]]` → `/content/raspberry-pi/`
  - `[[file:guides/linux.org][Linux Guide]]` → `/content/guides/linux/`
  - `[[../notes/debugging]]` (from a nested directory) → `/content/notes/debugging/`
  Backlinks are regenerated automatically and appended as a “Linked References” section if other pages point to the current file.

## Tooling & Scripts
Commonly used pnpm scripts:

| Script | Description |
| --- | --- |
| `pnpm run dev` | Start the Astro dev server |
| `pnpm run build` | Type-check and create a production build |
| `pnpm run preview` | Preview the built site |
| `pnpm run deploy` | Build and deploy with Cloudflare `wrangler` |
| `pnpm run check` | Static analysis via `astro check` |
| `pnpm run type-check` | `tsc --noEmit` for the integration and utilities |
| `pnpm run lint` | ESLint over `src/` and root JS/TS files |
| `pnpm run test` | Run all Vitest suites |

## Testing
- Unit tests cover the Org integration, link resolver, backlinks builder, and renderer utilities. Run `pnpm run test` while developing new features.
- `pnpm run validate` executes type checks, linting, and the test suite for CI-style verification.

## Project Layout Highlights
- `src/lib/astro-org.ts` – Integration that wires Org parsing into Astro.
- `src/lib/plugins/` – Rehype/unified plugins for frontmatter, backlinks, headline adjustments, and link resolution.
- `src/pages/` – Astro pages for the index, content routing, and RSS feed.
- `content/` – Org-mode source files that feed the site.

## Notes
- The integration adds telemetry (via `Symbol.for('org-component')`) so Org components render through the JSX renderer while preserving Astro’s error hints.
- Backlink caching is stored under `.astro/backlinks.json`. The cache invalidates automatically when source files change, but you can delete it or call the exported `clearBackLinksCache` during development if needed.
