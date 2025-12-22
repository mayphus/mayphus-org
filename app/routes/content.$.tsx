import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getPost } from "~/models/content.server";
import React, { useState, useEffect } from "react";
import { cn } from "~/lib/utils";

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
const posts = import.meta.glob<{ default: React.ComponentType }>(
    "/content/**/*.org"
);

const components = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl" {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight" {...props} />
    ),
    h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h4 className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a className="font-medium text-primary underline underline-offset-4" {...props} />
    ),
    blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
        <blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
        <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
    ),
    code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
        // If it's a code block (inside <pre>), it likely has a language class
        const isBlock = className?.includes("language-");
        return (
            <code
                className={cn(
                    "relative font-mono text-sm",
                    isBlock ? "text-zinc-50" : "rounded bg-muted px-[0.3rem] py-[0.2rem] font-semibold",
                    className
                )}
                {...props}
            />
        );
    },
    // Pre is often used for code blocks, ensuring it scrolls and has background
    pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
        <pre
            className={cn(
                "mb-4 mt-6 overflow-x-auto rounded-lg border bg-zinc-950 py-4",
                className
            )}
            {...props}
        />
    ),
};

export default function BlogPost() {
    const { postMetadata } = useLoaderData<typeof loader>();

    return (
        <div className="px-6 md:px-12 py-6 lg:py-16">
            <article className="mx-auto">
                <div className="space-y-4">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                        <Link to="/" className="hover:opacity-80 transition-opacity">
                            {postMetadata.title}
                        </Link>
                    </h1>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <time>{new Date(postMetadata.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}</time>
                        {postMetadata.tags?.map(tag => (
                            <span key={tag} className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mt-8">
                    <PostContent slug={postMetadata.slug} />
                </div>
            </article>
        </div>
    );
}

function PostContent({ slug }: { slug: string }) {
    const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

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
        return <div className="mt-8 text-muted-foreground">Loading...</div>;
    }

    return <Component components={components} />;
}
