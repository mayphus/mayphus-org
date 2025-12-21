import { json, type MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getPosts } from "~/models/content.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Mayphus" },
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
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <div>
                <div>
                    <h1>Mayphus</h1>
                    <p>Personal website and blog of Mayphus.</p>
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
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
