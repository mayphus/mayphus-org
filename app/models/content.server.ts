import { normalizePost, type Post } from "./content.utils";

const modules = import.meta.glob<{
    default: any;
    attributes?: Record<string, any>; // Orgx exports attributes (frontmatter) here
}>("/content/**/*.org", { eager: true });

export { type Post };

export function transformModulesToPosts(inputModules: Record<string, any>) {
    const posts = Object.entries(inputModules).map(([path, mod]) => normalizePost(path, mod));

    return posts.sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeB - timeA;
    });
}

export function getPosts() {
    return transformModulesToPosts(modules);
}

export function getPost(slug: string) {
    const posts = transformModulesToPosts(modules);
    return posts.find(p => p.slug === slug) || null;
}
