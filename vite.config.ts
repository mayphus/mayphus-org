import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import org from "./app/lib/plugins/vite-plugin-org";
import uniorgSlug from "uniorg-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import { customHeadline } from "./app/lib/plugins/headline";
import { extractKeywords } from "uniorg-extract-keywords";
import { initFrontmatter, keywordsToFrontmatter } from "./app/lib/plugins/frontmatter";

export default defineConfig({
    plugins: [
        remix({
            future: {
                v3_fetcherPersist: true,
                v3_relativeSplatPath: true,
                v3_throwAbortReason: true,
            },
        }),
        tsconfigPaths(),
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
});
