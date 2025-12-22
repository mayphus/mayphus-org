export interface Post {
    slug: string;
    title: string;
    date: string;
    tags?: string[];
    description?: string;
    Component: any; // The React component for the Org content
}

export function parseDate(dateStr: string | undefined): string {
    if (!dateStr) return new Date().toISOString();

    const clean = String(dateStr).trim();

    // Handle Org mode timestamps: [2024-01-22 Mon 11:45] or [2024-01-22 Mon]
    // Relaxed regex: allow flexible spacing and optional day/time
    const orgTimestamp = clean.match(/^\[(\d{4}-\d{2}-\d{2})(?:\s+[a-zA-Z]{3})?(?:\s+(\d{2}:\d{2}))?\s*\]$/);

    if (orgTimestamp) {
        const datePart = orgTimestamp[1];
        const timePart = orgTimestamp[2] || "00:00";
        return `${datePart}T${timePart}:00`;
    }

    return clean;
}

export function normalizePost(path: string, mod: { default: any; attributes?: Record<string, any> }): Post {
    // path is like "/content/blog/hello-world.org"
    // we want the slug to be "blog/hello-world" or just "hello-world" depending on structure
    // standardizing to just the filename for now if flattened, or preserving structure from content/ root
    const slug = path.replace("/content/", "").replace(".org", "");

    // Safety check for missing attributes
    const attrs = mod.attributes || {};

    if (!mod.attributes) {
        console.warn(`[Content] Warning: No attributes found for file ${path}. Defaulting to empty metadata.`);
    }

    // Ensure tags is an array
    let tags = attrs.filetags || [];
    if (typeof tags === 'string') {
        tags = tags.split(/:|\s+/).filter(Boolean);
    }

    return {
        slug,
        title: attrs.title || "Untitled",
        date: parseDate(attrs.date),
        tags: Array.isArray(tags) ? tags : [],
        description: attrs.description,
        Component: mod.default,
    };
}
