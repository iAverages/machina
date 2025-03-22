import { createAuthClient } from "better-auth/solid";
import { env } from "~/env-client";

export const authClient = createAuthClient({
    baseURL: env.PUBLIC_AUTH_URL,
});
