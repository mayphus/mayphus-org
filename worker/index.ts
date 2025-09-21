/* global Request, Response, Headers, fetch */

type AssetNamespace = {
  fetch: typeof fetch;
};

interface Env {
  ASSETS: AssetNamespace;
}

const buildAssetRequest = (request: Request, pathname: string): Request => {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url.toString(), request);
};

const candidatePaths = (pathname: string): string[] => {
  const paths = new Set<string>();
  paths.add(pathname);

  if (!pathname.endsWith('/')) {
    paths.add(`${pathname}.html`);
    paths.add(`${pathname}/index.html`);
  } else {
    paths.add(`${pathname}index.html`);
  }

  if (pathname === '/' || pathname === '') {
    paths.add('/index.html');
  }

  return Array.from(paths);
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    for (const pathCandidate of candidatePaths(url.pathname)) {
      const assetRequest = buildAssetRequest(request, pathCandidate);
      const assetResponse = await env.ASSETS.fetch(assetRequest);
      if (assetResponse.ok) {
        return assetResponse;
      }
    }

    const notFoundRequest = buildAssetRequest(request, '/404.html');
    const notFoundResponse = await env.ASSETS.fetch(notFoundRequest);
    if (notFoundResponse.ok) {
      return new Response(notFoundResponse.body, {
        status: 404,
        headers: new Headers(notFoundResponse.headers),
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
