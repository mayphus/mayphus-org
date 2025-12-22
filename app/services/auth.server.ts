import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { getSessionStorage } from "./session.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
}

// Export a function to get the authenticator
export const getAuthenticator = (env: any) => {
    const sessionStorage = getSessionStorage(env);
    const authenticator = new Authenticator<User>(sessionStorage);

    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
        throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set");
    }

    const gitHubStrategy = new GitHubStrategy(
        {
            clientID: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
            callbackURL: "/auth/github/callback",
        },
        async ({ profile }) => {
            // Check if restricted to a specific user
            if (env.ADMIN_GITHUB_USERNAME) {
                // @ts-ignore - _json is usually present in the profile
                const username = profile._json?.login;
                if (!username || username.toLowerCase() !== env.ADMIN_GITHUB_USERNAME.toLowerCase()) {
                    throw new Error("Unauthorized user");
                }
            }

            // Here you can fetch the user from database or return a user object based on the profile
            // For now we just return the profile info
            return {
                id: profile.id,
                email: profile.emails?.[0].value || "",
                name: profile.displayName,
                avatarUrl: profile.photos?.[0].value || "",
            };
        }
    );

    authenticator.use(gitHubStrategy);

    return authenticator;
};
