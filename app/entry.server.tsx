/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import type { EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
type MessagePortLike = {
    onmessage: ((event: MessageEvent) => void) | null;
    postMessage: (data: unknown) => void;
    start: () => void;
    close: () => void;
    _other?: MessagePortLike;
};

function ensureMessageChannel() {
    if (globalThis.MessageChannel) {
        return;
    }

    class SimpleMessagePort implements MessagePortLike {
        onmessage: ((event: MessageEvent) => void) | null = null;
        _other?: MessagePortLike;

        postMessage(data: unknown) {
            const target = this._other;
            if (!target?.onmessage) {
                return;
            }

            queueMicrotask(() => {
                target.onmessage?.({ data } as MessageEvent);
            });
        }

        start() {}
        close() {}
    }

    class SimpleMessageChannel {
        port1: MessagePortLike;
        port2: MessagePortLike;

        constructor() {
            this.port1 = new SimpleMessagePort();
            this.port2 = new SimpleMessagePort();
            this.port1._other = this.port2;
            this.port2._other = this.port1;
        }
    }

    globalThis.MessageChannel = SimpleMessageChannel as typeof MessageChannel;
}

async function getRenderToReadableStream() {
    ensureMessageChannel();
    const mod = await import("react-dom/server.browser");
    return mod.renderToReadableStream ?? mod.default?.renderToReadableStream;
}

export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
) {
    const renderToReadableStream = await getRenderToReadableStream();
    if (!renderToReadableStream) {
        throw new Error("renderToReadableStream is unavailable.");
    }

    const body = await renderToReadableStream(
        <RemixServer context={remixContext} url={request.url} />,
        {
            signal: request.signal,
            onError(error: unknown) {
                // Log streaming rendering errors from inside the shell
                console.error(error);
                responseStatusCode = 500;
            },
        }
    );

    if (isbot(request.headers.get("user-agent") || "")) {
        await body.allReady;
    }

    responseHeaders.set("Content-Type", "text/html");
    return new Response(body, {
        headers: responseHeaders,
        status: responseStatusCode,
    });
}
