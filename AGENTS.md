# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains the Remix application source code.
  - `routes/`: Defines the URL routes of the application. Use `_index.tsx` for the root path.
  - `components/`: Reusable React components. Use Shadcn UI patterns where applicable.
  - `models/`: Logic for data fetching and processing (e.g., parsing Org files).
  - `utils/`: Shared utility functions.
- `content/`: Stores Org-mode source files processed at build time.
- `public/`: Serves static assets directly.

## Build, Test, and Development Commands
- `pnpm run dev`: Launches the Remix dev server with Cloudflare emulation.
- `pnpm run build`: Builds the application for production (Cloudflare Workers).
- `pnpm run start`: Serves the built application locally.
- `pnpm run test`: Runs unit tests using Vitest.
- `pnpm run typecheck`: Runs TypeScript type checking.
- `pnpm run lint`: Runs ESLint.

## Coding Style & Naming Conventions
- **TypeScript**: Strict type safety is mandatory. No `any` unless absolutely necessary and documented.
- **PascalCase** for React components (e.g., `SiteHeader.tsx`).
- **kebab-case** for file names in general, especially routes.
- **Functional Components**: Use functional components with hooks.
- **Tailwind CSS**: Use utility classes for styling. Avoid custom CSS files unless defining global styles or complex animations.

## Testing Guidelines
- Write unit tests for all utility functions and complex logic in `models/`.
- Use `*.test.ts` or `*.test.tsx` for test files, colocated with the source code.
- Ensure all tests pass before committing: `pnpm run test`.
- Use Vitest for testing.

## Commit & Pull Request Guidelines
- Follow conventional commits (`feat:`, `fix:`, `style:`, `refactor:`, `chore:`).
- Keep commits focused and atomic.
