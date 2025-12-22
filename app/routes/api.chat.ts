import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function action({ request, context }: ActionFunctionArgs) {
    const env = (context as any).env;
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
        return json({ error: "GEMINI_API_KEY not found" }, { status: 500 });
    }

    const { messages } = await request.json() as any;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const history = messages.slice(0, -1).map((m: any) => ({
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
}
