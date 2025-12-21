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

        <ul className="not-prose mt-6 list-none space-y-2 p-0">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/content/${post.slug}`}
                className="block rounded-md p-4 transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <h2 className="m-0 text-lg font-semibold leading-tight text-foreground">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
