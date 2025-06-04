# AI Agent Context for mayphus.org

## About AGENTS.md

This file provides context for AI assistants (Claude, GPT, Cursor, etc.) working on this project. It's specifically designed to help AI understand the codebase structure, conventions, and important context that might not be obvious from the code alone.

## Project Overview

**mayphus.org** is the personal website and digital workshop of Mayphus Tang - a content-first website built with Astro that publishes content written in Emacs Org-mode format.

- **Primary Goal**: Share knowledge, projects, and learning journey
- **Content Types**: Notes (quick ideas), Articles (in-depth), Projects (builds)
- **Audience**: Makers, developers, engineers, learners
- **Philosophy**: Clean, readable, content-first over flashy design

## Tech Stack & Architecture

### Core Framework
- **Astro 5.8+** - Static site generator with content collections
- **TypeScript** - Type safety throughout
- **uniorg** - Custom Org-mode parser pipeline
- **Cloudflare Pages** - Hosting and CI/CD

### Key Dependencies
- `rollup-plugin-orgx` - Custom Org-mode processing
- `uniorg-*` packages - Org-mode parsing and processing
- `rehype-*` packages - HTML post-processing
- `@astrojs/sitemap`, `@astrojs/rss` - SEO and feeds

### Content Pipeline
1. Org-mode files in `/content/` directory
2. Processed by uniorg pipeline in `src/lib/astro-org`
3. Custom plugins for keywords and headlines
4. Converted to Astro content collections
5. Rendered via Astro layouts and components

## File Structure & Conventions

```
├── content/                 # Org-mode content files
│   └── *.org               # YYYYMMDDTHHMMSS--title__tags.org format
├── src/
│   ├── components/         # Reusable Astro components
│   ├── layouts/           # Page layouts
│   ├── lib/               # Custom libraries and utilities
│   │   ├── astro-org      # Custom Org-mode integration
│   │   └── plugins/       # Content processing plugins
│   ├── pages/             # Astro pages and routes
│   └── styles/            # CSS/styling
├── public/                # Static assets
└── astro.config.mjs       # Astro configuration
```

## Content System

### Org-mode File Naming
- Format: `YYYYMMDDTHHMMSS--title__tags.org`
- Example: `20240919T214636--org-mode__emacs.org`
- Tags are double-underscore separated
- Used for automatic slug generation and categorization

### Content Types (Inferred from tags)
- **Notes**: Quick references, learning logs (default)
- **Articles**: In-depth explorations (`__article` tag)
- **Projects**: Hardware/software builds (`__project` tag)

### Frontmatter (Org-mode)
```org
#+title: Page Title
#+date: [2024-01-01]
#+filetags: :tag1:tag2:
#+description: Optional description
```

## Development Conventions

### Code Style
- TypeScript throughout - prefer type safety
- Minimal, clean code over complex abstractions
- Content-first approach - don't over-engineer
- Prefer Astro's built-in features over external libraries

### Content Management
- All content in Org-mode format
- Prefer writing in Emacs with denote package
- Tags for categorization, not complex taxonomies
- Simple, readable URLs from slugs

### Performance Priorities
1. Fast loading (static generation)
2. Clean HTML output
3. Minimal JavaScript
4. SEO-friendly structure

## Important Context for AI Assistants

### When Working on This Project:

1. **Respect the Org-mode workflow** - Don't suggest moving away from Org-mode
2. **Keep it simple** - Avoid over-engineering solutions
3. **Content-first** - Any changes should serve content presentation
4. **Maintain the pipeline** - Be careful with uniorg integration changes
5. **TypeScript always** - Add types for any new code
6. **Test content rendering** - Changes can break Org-mode processing

### Common Tasks:
- Adding new components for content presentation
- Improving the Org-mode processing pipeline
- SEO and performance optimizations
- Adding new content types/layouts
- Styling improvements (minimal, clean aesthetic)

### Avoid:
- Complex state management (it's mostly static)
- Heavy JavaScript frameworks
- Breaking the Org-mode content pipeline
- Over-complicated build processes
- Flashy designs that distract from content

## Testing & Development

### Local Development
```bash
npm run dev          # Start dev server (usually port 4322)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Content Testing
- Check Org-mode files render correctly
- Verify tags and metadata are processed
- Test different content types (notes/articles/projects)
- Ensure links and cross-references work

## Contact & Philosophy

**Author**: Mayphus Tang (tangmeifa@gmail.com)
**Approach**: Maker mindset - build, learn, share, iterate
**Values**: Simplicity, readability, genuine content over marketing

---

*This file should be updated when significant architectural changes occur or new conventions are established.* 