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
        <main>
            <div>
                <div>
                    <h1>Latest Updates</h1>
                    <p>My thoughts on tech, life, and everything in between.</p>
                </div>

                <ul>
                    {posts.map((post) => (
                        <li key={post.slug}>
                            <Link to={`/content/${post.slug}`}>
                                <h2>
                                    {post.title}
                                </h2>
                                {post.description && (
                                    <p>{post.description}</p>
                                )}
                                <div>
                                    <time dateTime={post.date}>
                                        {new Date(post.date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </time>
                                    {post.tags && post.tags.length > 0 && (
                                        <span>
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
