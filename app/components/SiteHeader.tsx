import { Link } from "@remix-run/react";
import { SITE_TITLE } from "~/consts";
import { SITE_NAVIGATION } from "~/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="container flex h-14 max-w-3xl items-center">
        <Link
          to="/"
          className="mr-6 text-sm font-semibold"
        >
          {SITE_TITLE}
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {SITE_NAVIGATION.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
