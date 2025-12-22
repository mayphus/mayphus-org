# mayphus-org

Personal knowledge garden and publication pipeline built with [Remix](https://remix.run/), [Vite](https://vitejs.dev/), and [Tailwind CSS](https://tailwindcss.com/). It uses [Cloudflare Workers](https://workers.cloudflare.com/) for deployment and parses Org-mode content on the fly.

## Features

- **Remix & Vite**: Modern web framework with fast HMR and optimized builds.
- **Org-mode Integration**: Glob imports via Vite to process `.org` files using `uniorg` and `rehype`.
- **Tailwind CSS & Shadcn UI**: Clean, minimal, and elegant styling.
- **Cloudflare Workers**: Edge deployment for high performance.
- **Visual Playground**: Interactive 3D sketches using Canvas API.

## Getting Started

### Prerequisites

- Node.js (latest stable)
- pnpm (latest)

### Install dependencies

```bash
pnpm install
```

### Local development

```bash
pnpm run dev
```

This starts the Remix dev server with Cloudflare emulation. The site will be available at `http://localhost:5173`.

### Build & Preview

```bash
pnpm run build
pnpm run start
```

### Testing

```bash
pnpm run test
pnpm run typecheck
pnpm run lint
```

## Project Structure

- `app/`: Source code for the Remix application.
  - `routes/`: File-system routing.
  - `components/`: React components.
  - `models/`: Data fetching and content processing logic.
  - `styles/`: Global styles (Tailwind).
- `content/`: Org-mode source files.
- `public/`: Static assets.

## Deployment

Deploy to Cloudflare Workers using Wrangler:

```bash
pnpm run deploy
```
