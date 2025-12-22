import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function action({ request, context }: ActionFunctionArgs) {
    const env = (context as any).env;
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing in env");
        return json({ error: "GEMINI_API_KEY not found" }, { status: 500 });
    }

    try {
        const payload = await request.json() as any;
        const messages = payload.messages;

        if (!messages || !Array.isArray(messages)) {
            return json({ error: "Invalid messages format" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const history = messages.slice(0, -1)
            .filter((m: any, i: number) => !(i === 0 && m.role !== "user")) // Ensure first message is user
            .map((m: any) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            }));

        const lastMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        return json({ content: text });
    } catch (error: any) {
        console.error("Chat API error:", error);
        return json({
            error: "Failed to generate response",
            details: error.message
        }, { status: 500 });
    }
}
