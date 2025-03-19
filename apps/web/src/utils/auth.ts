import { createAuthClient } from "better-auth/solid";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3002", // the base url of your auth server
});
