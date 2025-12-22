import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
    return redirect("/login");
}

export async function action({ request, context }: ActionFunctionArgs) {
    const env = (context as any).env;
    const authenticator = getAuthenticator(env);
    return await authenticator.authenticate("github", request);
}
