import { defineConfig } from 'vitest/config';
import org from "./app/lib/plugins/vite-plugin-org";
import uniorgSlug from "uniorg-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import { customHeadline } from "./app/lib/plugins/headline";
import { extractKeywords } from "uniorg-extract-keywords";
import { initFrontmatter, keywordsToFrontmatter } from "./app/lib/plugins/frontmatter";

export default defineConfig({
  plugins: [
    org({
        include: "**/*.org",
        uniorgPlugins: [
            initFrontmatter,
            [extractKeywords, { name: "keywords" }],
            keywordsToFrontmatter,
            customHeadline,
            uniorgSlug
        ],
        rehypePlugins: [
            [rehypeAutolinkHeadings, { behavior: "prepend", content: { type: "text", value: "# " } }],
            [rehypeShiki, { themes: { light: "min-light", dark: "min-dark" } }]
        ],
        jsxImportSource: "react"
    }),
  ],
  test: {
    // Enable TypeScript support
    globals: true,
    environment: 'node',
    
    // Test file patterns
    include: ['app/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    
    // Setup files (if needed)
    // setupFiles: ['./test/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  
  // Resolve aliases to match your project structure
  resolve: {
    alias: {
      '~': './app',
    },
  },
});