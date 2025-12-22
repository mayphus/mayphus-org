import { Link, useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";

export function Header() {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Writing", path: "/#writing" },
  ];

  if (location.pathname !== "/") return null;

  return (
    <header className="flex md:hidden w-full flex-col border-b border-border/40 bg-background/50 backdrop-blur-sm px-6 py-6 gap-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src="/favicon.svg" alt="Logo" className="h-8 w-8" />
          <span className="font-bold text-xl tracking-tight">Mayphus</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "transition-colors hover:text-primary",
                location.pathname === item.path ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Welcome to my digital garden. I write about full-stack engineering,
          AI agents, and the process of creating meaningful software.
        </p>
      </div>
    </header>
  );
}
