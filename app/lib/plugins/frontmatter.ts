import { type VFile } from 'vfile';

export function initFrontmatter() {
    return transformer;

    function transformer(_tree: unknown, file: VFile) {
        if (!file.data.frontmatter) {
            file.data.frontmatter = {};
        }
        // Also init attributes if that's what orgx wants
        if (!file.data.attributes) {
            file.data.attributes = {};
        }
    }
}

export function keywordsToFrontmatter() {
    return transformer;

    function transformer(_tree: unknown, file: VFile) {
        // Extract keywords (TITLE, DATE, etc) found by uniorg-extract-keywords
        const keywords = (file.data as any).keywords || {};

        // DEBUG LOGGING
        if (Object.keys(keywords).length > 0) {
            console.log(`[Frontmatter] Extracted keywords for ${file.path}:`, Object.keys(keywords));
        }

        // Map them to frontmatter
        const data = file.data as any;

        data.frontmatter = {
            ...data.frontmatter,
            ...keywords,
        };

        // Normalize logic
        if (keywords.TITLE && !data.frontmatter.title) data.frontmatter.title = keywords.TITLE;
        if (keywords.DATE && !data.frontmatter.date) data.frontmatter.date = keywords.DATE;
        if (keywords.DESCRIPTION && !data.frontmatter.description) data.frontmatter.description = keywords.DESCRIPTION;

        // Normalize filetags to array from string (e.g. ":tag1:tag2:")
        // We prioritize keywords.FILETAGS, but also check existing frontmatter.filetags
        const rawTags = keywords.FILETAGS || data.frontmatter.filetags;
        if (rawTags) {
            if (typeof rawTags === 'string') {
                // Org mode tags often look like ":tag1:tag2:" or "tag1 tag2"
                // splitting by colon and filtering empty is standard for :colons:
                data.frontmatter.filetags = rawTags.split(/:|\s+/).filter(Boolean);
            } else if (Array.isArray(rawTags)) {
                data.frontmatter.filetags = rawTags;
            }
        }

        // SYNC to file.data.attributes just in case rollup-plugin-orgx uses that
        data.attributes = {
            ...data.attributes,
            ...data.frontmatter
        };

        // SYNC to file.data.astro.frontmatter (Astro legacy)
        if (!data.astro) {
            data.astro = { frontmatter: {} };
        }
        data.astro.frontmatter = {
            ...data.astro.frontmatter,
            ...data.frontmatter
        };

        // Also try 'meta'
        data.meta = {
            ...data.meta,
            ...data.frontmatter
        };
    }
}
