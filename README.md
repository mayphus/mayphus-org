<p align="center">
  <img src="https://mayphus.org/favicon.svg" alt="mayphus.org logo" width="120" />
</p>

<h1 align="center">mayphus.org</h1>

<p align="center">
  <a href="https://github.com/mayphus/mayphus.org/actions/workflows/ci.yml"><img src="https://github.com/mayphus/mayphus.org/actions/workflows/ci.yml/badge.svg" alt="CI Status"></a>
  <a href="https://mayphus.org/"><img src="https://img.shields.io/website?url=https%3A%2F%2Fmayphus.org" alt="Website"></a>
  <a href="https://github.com/mayphus/mayphus.org/blob/main/LICENSE"><img src="https://img.shields.io/github/license/mayphus/mayphus.org" alt="License"></a>
</p>

---

This is the source code for [mayphus.org](https://mayphus.org/), the digital workshop and knowledge garden of <strong>Mayphus Tang</strong> — maker, dad, and perpetual learner. Here you'll find a blend of technology, engineering, and creative craftsmanship, from 3D printing to electronics, coding, and beyond.

**Design Philosophy**: Following Dieter Rams' "Good Design" principles — "Less but better" — this site prioritizes function, accessibility, and timeless aesthetics over visual complexity.

## 🚀 Features

### **Core Content System**
- **Custom Org-mode Integration**: Native `.org` file processing with custom Astro integration
- **Denote Convention Support**: Structured filenames (`YYYYMMDDTHHMMSS--title__tags.org`)
- **Cross-linking System**: Denote-style ID linking between content pieces
- **Content Collections**: Type-safe content with Zod schema validation
- **Tag-based Browsing**: Dynamic pages for each tag

### **Content Management**
- **Emacs Workflow**: Seamless integration with Emacs org-mode for writing
- **Frontmatter Extraction**: Automatic processing of Org-mode keywords
- **Tag-based Organization**: Flexible content classification and filtering
- **Date-based Navigation**: Chronological browsing with month/year grouping
- **Personal Knowledge Base**: Bridges private notes and public content

### **Performance & Optimization**
- **99% Lighthouse Performance**: Optimized for speed and Core Web Vitals
- **Minimal JavaScript**: Static-first with progressive enhancement
- **Optimized Font Loading**: System fonts for instant rendering
- **Async Analytics**: Deferred Google Analytics with requestIdleCallback
- **Edge Deployment**: Cloudflare Workers for global performance
- **Environmental Consciousness**: Minimal resource usage following Rams' principle #9

### **Developer Experience**
- **TypeScript**: Full type safety with strict null checks
- **Hot Reload**: Instant development feedback with Astro dev server
- **Plugin Architecture**: Extensible content processing system
- **Build Integration**: TypeScript checking integrated with build process
- **Custom Plugins**: Keyword processing, headline adjustment, link resolution

### **Design & Accessibility**
- **Dieter Rams Philosophy**: "Less but better" — minimal design focused on function
- **100% Lighthouse Accessibility**: WCAG AA compliance with 4.5:1+ contrast ratios
- **System Typography**: Native system fonts for performance and familiarity
- **Subtle Interactions**: Minimal borders and transitions, no visual noise
- **Dark Mode**: Automatic theme switching with consistent color relationships
- **Responsive Design**: Mobile-first approach with semantic breakpoints

### **Code Highlighting**
- **Highlight.js Integration**: Syntax highlighting with GitHub themes
- **Multi-language Support**: JavaScript, Python, Bash, CSS, Lisp, Emacs Lisp
- **Dynamic Loading**: Languages loaded on-demand for performance
- **Custom Styling**: Light/dark theme support with custom overrides

### **SEO & Social**
- **RSS Feed**: Full-content RSS feed generation
- **Sitemap**: Automatic sitemap generation
- **Open Graph**: Social media preview support
- **Twitter Cards**: Twitter-specific metadata
- **Structured Data**: JSON-LD Person schema
- **Canonical URLs**: Proper URL canonicalization

## 🎨 Design Philosophy

This website embodies **Dieter Rams' 10 Principles of Good Design**:

1. **Good design is innovative** — Custom Org-mode integration for unique publishing workflow
2. **Good design makes a product useful** — Fast loading, clear navigation, readable typography
3. **Good design is aesthetic** — Minimal color palette, system fonts, purposeful spacing
4. **Good design makes a product understandable** — Intuitive structure, semantic HTML
5. **Good design is unobtrusive** — Content-first approach, no visual clutter
6. **Good design is honest** — Authentic personal content, no engagement manipulation
7. **Good design is long-lasting** — Timeless typography, semantic markup, accessibility-first
8. **Good design is thorough down to the last detail** — 100% Lighthouse scores, perfect contrast
9. **Good design is environmentally friendly** — Minimal JS, efficient caching, static generation
10. **Good design is as little design as possible** — **"Less but better"** — Essential elements only

### Standards

- **Accessibility**: 100% Lighthouse accessibility score (WCAG AA compliance)
- **Performance**: 99%+ Lighthouse performance score  
- **Colors**: Minimal palette with 4.5:1+ contrast ratios
- **Typography**: System fonts for performance and consistency
- **Interactions**: Subtle borders for link distinction without visual noise

## 🛠️ Tech Stack

**Core Framework**
- [Astro 5.9.2](https://astro.build) — Modern static site generator with SSR
- [TypeScript](https://www.typescriptlang.org/) — Full type safety with strict null checks
- [Vite](https://vitejs.dev/) — Build tooling and development server

**Content Processing**
- [uniorg](https://github.com/rasendubi/uniorg) — Org-mode parser for JavaScript/TypeScript
- [rollup-plugin-orgx](https://www.npmjs.com/package/rollup-plugin-orgx) — Org-mode to JSX compilation
- [Zod](https://zod.dev/) — Schema validation for content collections

**Deployment & Performance**
- [Cloudflare Workers](https://workers.cloudflare.com/) — Edge deployment and hosting
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) — Cloudflare CLI and deployment
- [Highlight.js](https://highlightjs.org/) — Syntax highlighting for code blocks

**Development Tools**
- [Astro Integrations](https://docs.astro.build/en/guides/integrations-guide/) — RSS, Sitemap, Prefetch
- Custom Org-mode integration with rehype plugins
- Google Analytics with performance optimizations

## 📚 Content

- [Tags](https://mayphus.org/tags/) — Browse content by topic

## ⚡ Quick Start

```bash
# Clone the repo
 git clone https://github.com/mayphus/mayphus.org.git
 cd mayphus.org

# Install dependencies
 npm install

# Start local dev server
 npm run dev
```

Visit [http://localhost:4321](http://localhost:4321) to view the site locally.

## 🤝 Contributing

Contributions, suggestions, and ideas are welcome! Feel free to open issues or pull requests. For content, submit Org-mode files or improvements to the publishing pipeline.

## 👤 Author

- **Mayphus Tang**  
  [Website](https://mayphus.org) · [GitHub](https://github.com/mayphus) · [YouTube](https://youtube.com/@mayphustang) · [Email](mailto:tangmeifa@gmail.com)

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
