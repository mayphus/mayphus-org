import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    isRouteErrorResponse,
    useRouteError,
} from "@remix-run/react";
import React from "react";
import type { LinksFunction } from "@remix-run/cloudflare";

export const links: LinksFunction = () => [];

function Document({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                <div>
                    {children}
                </div>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return (
        <Document>
            <Outlet />
        </Document>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                <div>
                    {isRouteErrorResponse(error) ? (
                        <>
                            <h1>{error.status}</h1>
                            <p>{error.statusText}</p>
                        </>
                    ) : (
                        <>
                            <h1>Error</h1>
                            <p>Something went wrong</p>
                            <pre>
                                {error instanceof Error ? error.stack : String(error)}
                            </pre>
                        </>
                    )}
                </div>
                <Scripts />
            </body>
        </html>
    );
}
