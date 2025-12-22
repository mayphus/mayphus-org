import { json, type MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
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
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="container px-4 md:px-6 relative z-10 max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                <span>Designing the Future</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Building Digital <br className="hidden lg:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  Experiences
                </span>
              </h1>
              <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl leading-relaxed">
                Welcome to my digital garden. I write about full-stack engineering, AI agents,
                and the process of creating meaningful software.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <a
                  href="#writing"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Read Blog
                </a>
                <a
                  href="https://github.com/mayphus"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  GitHub
                </a>
              </div>
            </div>
            {/* Visual Decoration / Abstract Art */}
            <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none aspect-square lg:aspect-auto h-full min-h-[300px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/20 rounded-full blur-3xl opacity-70 animate-pulse" />
              <div className="relative z-10 bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <pre className="text-xs sm:text-sm font-mono text-muted-foreground overflow-hidden">
                  {`function createMagic() {
  const passion = true;
  const tools = ["Remix", "AI", "Design"];
  
  return tools.map(tool => {
    return build(tool, passion);
  });
}

// > Initialized...`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      </section>

      {/* Writing Section */}
      <section id="writing" className="container px-4 md:px-6 max-w-5xl">
        <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Recent Writing</h2>
          <Link to="/archive" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center">
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/content/${post.slug}`}
              className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:bg-accent/5 overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                Read Article <ArrowRight className="ml-1 h-4 w-4" />
              </div>

              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 scale-x-0 opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
