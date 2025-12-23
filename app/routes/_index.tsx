import { json, type MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getPosts } from "~/models/content.server";
import { Card, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

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
    <div className="flex flex-col gap-8 pb-8">
      {/* Writing Section */}
      <section id="writing" className="p-5">
        <div className="flex items-center pb-4 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Writing</h2>
        </div>
        <Separator className="mb-8" />

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/content/${post.slug}`}
              className="group"
            >
              <Card className="h-full transition-all hover:bg-muted/30 hover:border-border overflow-hidden border-border/50">
                <CardHeader className="p-5 space-y-3">
                  <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {post.tags && post.tags.length > 0 ? (
                      post.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="rounded-sm px-1 font-semibold text-[10px] uppercase tracking-wider">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </CardTitle>
                  {post.description && (
                    <CardDescription className="text-muted-foreground/80 text-xs line-clamp-2 leading-relaxed">
                      {post.description}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
