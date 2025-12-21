export interface Post {
    slug: string;
    title: string;
    date: string;
    tags?: string[];
    description?: string;
    Component: any; // The React component for the Org content
}

const modules = import.meta.glob<{
    default: any;
    attributes?: Record<string, any>; // Orgx exports attributes (frontmatter) here
}>("/content/**/*.org", { eager: true });

export function getPosts() {
    const posts = Object.entries(modules).map(([path, mod]) => {
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
            date: attrs.date || new Date().toISOString(), // Fallback date
            tags: Array.isArray(tags) ? tags : [],
            description: attrs.description,
            Component: mod.default,
        };
    });

    return posts.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB.getTime() - dateA.getTime();
    });
}

export function getPost(slug: string) {
    // Try exact match first
    for (const [path, mod] of Object.entries(modules)) {
        const s = path.replace("/content/", "").replace(".org", "");
        if (s === slug) {
            const attrs = mod.attributes || {};

            // Ensure tags is an array
            let tags = attrs.filetags || [];
            if (typeof tags === 'string') {
                tags = tags.split(/:|\s+/).filter(Boolean);
            }

            return {
                slug,
                title: attrs.title || "Untitled",
                date: attrs.date || new Date().toISOString(),
                tags: Array.isArray(tags) ? tags : [],
                description: attrs.description,
                Component: mod.default,
            };
        }
    }
    return null;
}
