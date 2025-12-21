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
import { Footer } from "./components/Footer";

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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col">
          <main className="container max-w-3xl flex-1 py-10">
            {children}
          </main>
          <Footer />
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
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="container max-w-3xl py-10">
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
