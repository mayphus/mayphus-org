import { Link, useLocation } from "@remix-run/react";
import { SITE_NAVIGATION } from "~/lib/site";
import { cn } from "~/lib/utils";

export function SiteHeader() {
    const location = useLocation();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center">
                <nav className="flex items-center gap-6 text-sm font-medium">
                    {SITE_NAVIGATION.map((link) => {
                        const isActive = link.href === "/"
                            ? location.pathname === "/"
                            : location.pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    isActive ? "text-foreground" : "text-foreground/60"
                                )}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </header>
    );
}
