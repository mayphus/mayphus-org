import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/services/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const env = (context as any).env;
    const authenticator = getAuthenticator(env);
    return await authenticator.authenticate("github", request, {
        successRedirect: "/admin",
        failureRedirect: "/login",
    });
}
