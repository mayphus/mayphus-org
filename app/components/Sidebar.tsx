import { Link, useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { Github, Twitter, Mail } from "lucide-react";

export function Sidebar() {
    const location = useLocation();

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Writing", path: "/#writing" },
    ];

    return (
        <aside className="w-full md:w-64 lg:w-80 md:sticky md:top-0 md:h-screen p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/40 bg-background/50 backdrop-blur-sm">
            <div className="space-y-12">
                {/* Brand/Logo */}
                <div className="flex flex-col gap-4">
                    <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                        <img src="/favicon.svg" alt="Logo" className="h-10 w-10" />
                        <span className="font-bold text-2xl tracking-tight">Mayphus</span>
                    </Link>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Building digital experiences at the intersection of code, design, and AI.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <a href="https://github.com/mayphus" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Github className="h-4 w-4" />
                            </a>
                            <a href="https://twitter.com/mayphus" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="mailto:hello@mayphus.org" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Mail className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Introduction */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                        Welcome to my digital garden. I write about full-stack engineering,
                        AI agents, and the process of creating meaningful software.
                    </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</h3>
                    <div className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>

            {/* Footer-like subtle part */}
            <div className="pt-12 text-xs text-muted-foreground/60">
                <p>© 2025 Mayphus</p>
                <p>All rights reserved.</p>
            </div>
        </aside>
    );
}
