import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";

export const auth = betterAuth({
    database: createPool({
        uri: process.env.DATABASE_URL,
    }),
    baseURL: "http://localhost:3002", // TODO: change to env var for prod
    trustedOrigins: () => {
        return ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];
    },
    advanced: {
        crossSubDomainCookies: {
            enabled: true,
        },
        cookiePrefix: "machina",
    },
    socialProviders: {
        spotify: {
            clientId: process.env.SPOTIFY_CLIENT_ID as string,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
        },
    },
});
