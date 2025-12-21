import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getPost } from "~/models/content.server";
import React, { useState, useEffect } from "react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data || !data.postMetadata) {
        return [{ title: "Not Found" }];
    }
    return [
        { title: data.postMetadata.title },
        { name: "description", content: data.postMetadata.description || "Blog post" },
    ];
};

export async function loader({ params }: LoaderFunctionArgs) {
    const slug = params["*"];
    if (!slug) throw new Response("Not Found", { status: 404 });

    const post = getPost(slug);
    if (!post) throw new Response("Not Found", { status: 404 });

    return json({ postMetadata: { ...post, Component: undefined } });
}

// Global glob import for client-side matching
const posts = import.meta.glob<{ default: React.ComponentType }>("/content/**/*.org");

export default function BlogPost() {
    const { postMetadata } = useLoaderData<typeof loader>();

    return (
        <div>
            <div className="container mx-auto py-10 px-4 max-w-3xl">
                <h1 className="text-4xl font-bold mb-4">{postMetadata.title}</h1>
                <div className="flex gap-2 text-muted-foreground mb-8">
                    <time>{new Date(postMetadata.date).toLocaleDateString()}</time>
                    {postMetadata.tags?.map(tag => <span key={tag}>#{tag}</span>)}
                </div>
                <PostContent slug={postMetadata.slug} />
            </div>
        </div>
    );
}

function PostContent({ slug }: { slug: string }) {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);

    useEffect(() => {
        const match = Object.keys(posts).find(path =>
            path === `/content/${slug}.org` || path.endsWith(`/${slug}.org`)
        );

        if (match && posts[match]) {
            posts[match]().then(mod => {
                setComponent(() => mod.default);
            });
        }
    }, [slug]);

    if (!Component) {
        return <div>Loading...</div>;
    }

    return (
        <article className="prose dark:prose-invert prose-slate lg:prose-lg max-w-none">
            <Component />
        </article>
    );
}
