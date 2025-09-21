# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains Astro pages, layouts, components, and utilities; add UI under `src/components/`, logic in `src/lib/`, and routes inside `src/pages/`.
- Tests live beside code as `*.test.ts`. Shared defaults sit in `src/config.ts` and `src/content.config.ts`.
- `content/` stores Org-mode sources processed at build time; register new collections in `src/content.config.ts`.
- `public/` serves static assets directly. Root configs (`astro.config.mjs`, `tailwind.config.mjs`, `vitest.config.ts`, `wrangler.jsonc`) govern build, styling, tests, and deployment.

## Build, Test, and Development Commands
- `pnpm run dev` launches the Astro dev server with hot reload.
- `pnpm run build` executes `astro check` then `astro build` to produce optimized output.
- `pnpm run preview` serves the latest build for production parity checks.
- `pnpm run lint`, `pnpm run type-check`, and `pnpm run test` cover ESLint, TypeScript, and Vitest validation.
- `pnpm run validate` chains all quality gates; run it before every pull request.
- `pnpm run deploy` builds then publishes with Cloudflare Wrangler; `pnpm run dev:wrangler` emulates workers locally.

## Coding Style & Naming Conventions
- TypeScript with modern ES modules is standard. Use 2-space indentation and avoid tabs (ESLint enforced).
- Favor PascalCase for components, camelCase for functions, and kebab-case for route filenames.
- Keep Astro templates lean by moving logic into helpers under `src/lib/`. Run `pnpm run lint` prior to committing to let `@typescript-eslint` and `eslint-plugin-astro` catch issues.

## Testing Guidelines
- Vitest powers unit coverage. Keep specs small, colocated, and named `*.test.ts` (e.g., `src/lib/plugins/backlinks.test.ts`).
- Use `describe` blocks per module and assert both success paths and failure handling. Snapshot output belongs beside the spec.
- Ensure `pnpm run validate` passes locally before requesting review; add tests for regressions or new behaviour.

## Commit & Pull Request Guidelines
- Follow conventional commits (`feat:`, `fix:`, `style:`, `chore:`) as seen in history and limit subjects to ~72 characters.
- Reference related issues, note breaking changes, and include relevant command output (e.g., `pnpm run validate`).
- For UI updates, attach before/after screenshots or GIFs and mention any content prerequisites.

## Deployment & Environment Notes
- Cloudflare Workers power production. Review `wrangler.jsonc` before altering routes or bindings and document changes.
- Secrets stay outside git; set them with `wrangler secrets put` and add defaults to `.env.example` when introducing new variables.
