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
import globalStylesUrl from "./styles/global.css?url";
import { Sidebar } from "./components/Sidebar";
import { TableOfContents } from "./components/TableOfContents";

// Font imports
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/ubuntu-mono/400.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStylesUrl },
];

const themeScript = `
(() => {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const applyTheme = (isDark) => {
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  applyTheme(media.matches);
  const listener = (event) => applyTheme(event.matches);
  if (media.addEventListener) {
    media.addEventListener("change", listener);
  } else {
    media.addListener(listener);
  }
})();
`;

function ThemeScript() {
  return (
    <script dangerouslySetInnerHTML={{ __html: themeScript }} />
  );
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex min-h-screen flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 min-w-0">
              <div className="w-full h-full">
                {children}
              </div>
            </main>
            <TableOfContents />
          </div>
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
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <div className="container max-w-3xl py-10">
          {isRouteErrorResponse(error) ? (
            <>
              <h1 className="text-4xl font-bold">{error.status}</h1>
              <p className="text-xl text-muted-foreground">{error.statusText}</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold">Error</h1>
              <p className="text-xl text-muted-foreground">Something went wrong</p>
              <pre className="mt-4 overflow-auto rounded bg-muted p-4 font-mono text-sm">
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
