import { json, type MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getPosts } from "~/models/content.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Mayphus.org" },
        { name: "description", content: "Personal website and blog of Mayphus." },
    ];
};

export async function loader() {
    const posts = getPosts();
    return json({ posts });
}

export default function Index() {
    const { posts } = useLoaderData<typeof loader>();

    return (
        <main className="container mx-auto py-10 px-4 max-w-3xl">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Latest Updates</h1>
                    <p className="text-muted-foreground">My thoughts on tech, life, and everything in between.</p>
                </div>

                <ul className="grid gap-6">
                    {posts.map((post) => (
                        <li key={post.slug} className="group flex flex-col gap-2 border-b pb-6 last:border-0 border-border">
                            <Link to={`/content/${post.slug}`} className="flex flex-col gap-1">
                                <h2 className="text-xl font-semibold group-hover:underline decoration-primary/50 underline-offset-4">
                                    {post.title}
                                </h2>
                                {post.description && (
                                    <p className="text-muted-foreground">{post.description}</p>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <time dateTime={post.date}>
                                        {new Date(post.date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </time>
                                    {post.tags && post.tags.length > 0 && (
                                        <span className="flex gap-1">
                                            •
                                            {post.tags.map(tag => <span key={tag}>#{tag}</span>)}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}
