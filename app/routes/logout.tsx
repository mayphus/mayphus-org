import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/services/auth.server";

export async function action({ request, context }: ActionFunctionArgs) {
    const env = (context as any).env;
    const authenticator = getAuthenticator(env);
    await authenticator.logout(request, { redirectTo: "/" });
}

export async function loader() {
    return redirect("/");
}
