import { createCookieSessionStorage } from "@remix-run/cloudflare";

export const getSessionStorage = (env: { SESSION_SECRET?: string, NODE_ENV?: string } | any) => createCookieSessionStorage({
    cookie: {
        name: "_session",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secrets: [env.SESSION_SECRET || "s3cr3t"],
        secure: env.NODE_ENV === "production",
    },
});

// We cannot export destuctured methods directly if storage depends on env
// Consumers must use getSessionStorage(env).getSession() etc.
