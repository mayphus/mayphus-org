import React, { useState, useRef, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Send } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function Chat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Welcome to the Studio. I'm Gemini, your creative partner. How shall we proceed today?" }
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
        <aside className="hidden md:flex w-full md:w-80 lg:w-96 md:sticky md:top-0 md:h-screen flex-col border-r border-border/40 bg-transparent transition-all duration-300">
            {/* Message Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide"
            >
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={cn(
                            "group flex flex-col gap-2 max-w-[90%]",
                            m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                    >

                        <div
                            className={cn(
                                "px-4 py-2.5 text-sm transition-all",
                                m.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none"
                                    : "bg-muted text-foreground rounded-2xl rounded-tl-none"
                            )}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex flex-col gap-2 mr-auto items-start">

                        <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-4 py-2.5 text-sm animate-pulse">
                            ...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6">
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-muted rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all border border-border/50"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="rounded-xl shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </aside>
    );
}
