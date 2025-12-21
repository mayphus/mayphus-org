
import { createRequestHandler } from "@remix-run/cloudflare";
import * as build from "../build/server/index.js";

// @ts-ignore - build type mismatch due to inferred types
const handleRequest = createRequestHandler(build as any);

export default {
  async fetch(request: Request, env: any, ctx: any) {
    try {
      // Pass env and ctx generally as loadContext
      return await handleRequest(request, { env, ctx });
    } catch (error) {
      console.error(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
};
