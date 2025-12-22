import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/services/auth.server";
import { Button } from "~/components/ui/button";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const env = (context as any).env;
    const authenticator = getAuthenticator(env);
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    return json({ user });
}

export default function Admin() {
    const { user } = useLoaderData<typeof loader>();

    return (
        <div className="container mx-auto p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Studio</h1>
                <Form method="post" action="/logout">
                    <Button type="submit" variant="destructive">
                        Logout
                    </Button>
                </Form>
            </div>

            <div className="mt-8">
                <div className="rounded-lg border p-6">
                    <h2 className="text-xl font-semibold mb-4">Welcome back, {user.name}!</h2>
                    <div className="flex items-center gap-4">
                        {user.avatarUrl && (
                            <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full" />
                        )}
                        <div>
                            <p className="text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-1">ID: {user.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
