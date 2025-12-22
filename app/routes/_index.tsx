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
    <div className="space-y-10 pb-10">
      <section className="space-y-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Mayphus
        </h1>
        <p className="text-xl text-muted-foreground max-w-[42rem] leading-normal">
          Personal website and blog. Sharing thoughts on technology,
          creativity, and the intersection of both.
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Writing</h2>
        </div>
        <ul className="grid gap-2">
          {posts.map((post) => (
            <li key={post.slug} className="group relative">
              <Link
                to={`/content/${post.slug}`}
                className="flex flex-col space-y-2 rounded-lg border border-transparent p-4 transition-all hover:bg-muted/50 hover:border-border"
              >
                <div className="flex flex-col justify-between space-y-1 sm:flex-row sm:items-center sm:space-y-0">
                  <h3 className="line-clamp-1 font-semibold text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <time className="shrink-0 text-sm text-muted-foreground">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
                {post.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

