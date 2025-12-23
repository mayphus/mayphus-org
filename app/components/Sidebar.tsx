import { Link, useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { Github, Twitter, Mail, MapPin } from "lucide-react";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";

export function Sidebar() {
    const location = useLocation();

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Writing", path: "/#writing" },
    ];

    return (
        <aside className="hidden md:flex w-full md:w-64 lg:w-80 md:sticky md:top-0 md:h-screen bg-background/50 backdrop-blur-sm">
            <ScrollArea className="h-full w-full">
                <div className="flex flex-col h-full p-5 gap-8">
                    {/* Brand/Profile */}
                    <div className="flex flex-col gap-6">
                        <Link to="/" className="group flex items-center gap-4 transition-all">
                            <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary/20 transition-all">
                                <AvatarImage src="/favicon.svg" alt="Mayphus" />
                                <AvatarFallback>MY</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl tracking-tight leading-none">Mayphus</span>
                                <span className="text-xs text-muted-foreground mt-1">Full-stack Engineer</span>
                            </div>
                        </Link>

                        <div className="space-y-4">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                Building digital experiences at the intersection of code, design, and AI. Exploring the future of agentic workflows.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>Based in the Digital World</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</h3>
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "text-sm transition-colors duration-200",
                                        location.pathname === item.path
                                            ? "text-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* Connect */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connect</h3>
                        <div className="flex items-center gap-4">
                            <a href="https://github.com/mayphus" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="https://twitter.com/mayphus" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="mailto:hello@mayphus.org" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Footer note */}
                    <div className="mt-auto">
                        <p className="text-[10px] text-muted-foreground/50 italic">
                            Updated Dec 2025
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </aside>
    );
}
