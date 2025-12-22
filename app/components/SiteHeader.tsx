import { Link, useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";

export function SiteHeader() {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Writing", path: "/#writing" },
  ];

  return (
    <header className="w-full border-b border-border/40 bg-background">
      <div className="container flex h-16 max-w-4xl items-center justify-between px-4 md:px-8">
        {/* Navigation on the left */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === item.path ? "text-foreground" : "text-foreground/60"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logo / Brand on the right */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="font-bold text-lg tracking-tight">Mayphus</span>
            <img src="/favicon.svg" alt="Logo" className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}
