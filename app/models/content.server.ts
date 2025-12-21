import { normalizePost, type Post } from "./content.utils";

const modules = import.meta.glob<{
    default: any;
    attributes?: Record<string, any>; // Orgx exports attributes (frontmatter) here
}>("/content/**/*.org", { eager: true });

export { type Post };

export function getPosts() {
    const posts = Object.entries(modules).map(([path, mod]) => normalizePost(path, mod));

    return posts.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB.getTime() - dateA.getTime();
    });
}

export function getPost(slug: string) {
    // Try exact match first
    for (const [path, mod] of Object.entries(modules)) {
        const post = normalizePost(path, mod);
        if (post.slug === slug) {
            return post;
        }
    }
    return null;
}
