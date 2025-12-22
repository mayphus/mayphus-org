import { json, type MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { getPosts } from "~/models/content.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Mayphus" },
    { name: "description", content: "Personal website and blog of Mayphus. Exploring code, design, and AI." },
  ];
};

export async function loader() {
  const posts = getPosts();
  return json({ posts });
}

export default function Index() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Writing Section */}
      <section id="writing" className="px-6 md:px-12 py-8 md:py-16">
        <div className="flex items-center border-b border-border/40 pb-4 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Writing</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/content/${post.slug}`}
              className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-5 transition-all hover:bg-muted/30 hover:border-border overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {post.tags && post.tags.length > 0 ? (
                    post.tags.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center rounded bg-secondary/40 px-1.5 py-0.5 font-semibold">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <div className="h-4" />
                  )}
                </div>
                <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="text-muted-foreground/80 text-xs line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
