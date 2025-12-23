import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/services/auth.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

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
        <div className="container mx-auto p-5 md:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Studio</h1>
                <Form method="post" action="/logout">
                    <Button type="submit" variant="destructive">
                        Logout
                    </Button>
                </Form>
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Welcome back, {user.name}!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-muted-foreground">{user.email}</p>
                                <p className="text-xs text-muted-foreground font-mono mt-1">ID: {user.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
