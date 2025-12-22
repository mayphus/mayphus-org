import React, { useState, useRef, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function StudioSidebar() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm Gemini, your studio assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const fetcher = useFetcher();
    const scrollRef = useRef<HTMLDivElement>(null);

    const isLoading = fetcher.state !== "idle";

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const data = fetcher.data as any;
        if (data && data.content && !isLoading) {
            setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        }
    }, [fetcher.data, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");

        fetcher.submit(
            { messages: newMessages } as any,
            { method: "post", action: "/api/chat", encType: "application/json" }
        );
    };

    return (
        <aside className="hidden md:flex w-full md:w-80 lg:w-96 md:sticky md:top-0 md:h-screen flex-col border-r border-border/40 bg-background/50 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/40 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg">
                        <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-none">Studio Assistant</h2>
                        <p className="text-xs text-muted-foreground mt-1">Gemini 3 Flash</p>
                    </div>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex flex-col gap-2 max-w-[85%]",
                            m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            {m.role === "assistant" ? (
                                <Bot className="h-3 w-3 text-primary" />
                            ) : (
                                <User className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                {m.role === "assistant" ? "Gemini" : "You"}
                            </span>
                        </div>
                        <div
                            className={cn(
                                "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                m.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted text-foreground rounded-tl-none"
                            )}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex flex-col gap-2 mr-auto items-start">
                        <div className="flex items-center gap-2">
                            <Bot className="h-3 w-3 text-primary animate-pulse" />
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                Thinking...
                            </span>
                        </div>
                        <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-sm animate-pulse">
                            ...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-border/40 bg-background/80">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="flex-1 bg-muted/50 border border-border/40 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-xl shrink-0"
                        disabled={isLoading || !input.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
                <p className="text-[10px] text-center text-muted-foreground mt-3">
                    AI may provide inaccurate information.
                </p>
            </div>
        </aside>
    );
}
