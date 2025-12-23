import { useState, useEffect } from "react";
import { useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

export function TableOfContents() {
    const location = useLocation();
    const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const updateToc = () => {
            if (location.pathname.startsWith("/content/")) {
                const main = document.querySelector("main");
                if (!main) return;
                const headings = Array.from(main.querySelectorAll("h2, h3"));
                const tocData = headings.map((h) => ({
                    id: h.id,
                    text: h.textContent || "",
                    level: parseInt(h.tagName.substring(1)),
                }));
                setToc(tocData);
            } else {
                setToc([]);
            }
        };

        // Update TOC after a short delay to allow content to render
        const timer = setTimeout(updateToc, 500);

        // Also update TOC when content might have changed (e.g. dynamic load)
        const observer = new MutationObserver(updateToc);
        const main = document.querySelector("main");
        if (main) {
            observer.observe(main, { childList: true, subtree: true });
        }

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [location.pathname]);

    useEffect(() => {
        if (toc.length === 0) return;

        const handleScroll = () => {
            if (window.scrollY < 100) {
                setActiveId("");
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && window.scrollY > 100) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-80px 0px -60% 0px",
                threshold: 1.0
            }
        );

        window.addEventListener("scroll", handleScroll);
        const headingElements = toc.map(item => document.getElementById(item.id)).filter(Boolean);
        headingElements.forEach(el => observer.observe(el!));

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, [toc]);

    if (toc.length === 0) return null;

    return (
        <aside className="hidden xl:block w-64 lg:w-72 shrink-0 md:sticky md:top-0 md:h-screen transition-all duration-300">
            <ScrollArea className="h-full p-5">
                <nav className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="sticky top-0 h-6 bg-background/50 text-[0.8rem] font-medium text-muted-foreground">On This Page</h3>
                    <div className="flex flex-col gap-2 pt-2">
                        {toc.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className={cn(
                                    "text-[0.8rem] transition-colors duration-200",
                                    item.level === 3 ? "pl-4" : "",
                                    activeId === item.id
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                                    window.history.pushState(null, "", `#${item.id}`);
                                }}
                            >
                                {item.text}
                            </a>
                        ))}
                    </div>
                </nav>
            </ScrollArea>
        </aside>
    );
}
