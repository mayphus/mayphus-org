import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    isRouteErrorResponse,
    useRouteError,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/cloudflare";
import styles from "./styles/global.css?url";
import { SiteHeader } from "~/components/SiteHeader";
import { Footer } from "~/components/Footer";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: styles },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
    },
];

function Document({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body className="flex min-h-screen flex-col font-sans antialiased text-foreground bg-background">
                <SiteHeader />
                <div className="flex-1">
                    {children}
                </div>
                <Footer />
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
            <body className="flex min-h-screen flex-col font-sans antialiased text-foreground bg-background">
                <SiteHeader />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    {isRouteErrorResponse(error) ? (
                        <>
                            <h1 className="text-4xl font-bold mb-2">{error.status}</h1>
                            <p className="text-muted-foreground">{error.statusText}</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl font-bold mb-2">Error</h1>
                            <p className="text-muted-foreground">Something went wrong</p>
                            <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto max-w-full">
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
