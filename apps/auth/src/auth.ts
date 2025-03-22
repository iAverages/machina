import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { createPool } from "mysql2/promise";
import { env } from "./env";

export const auth = betterAuth({
    database: createPool({
        uri: env.DATABASE_URL,
    }),
    baseURL: env.AUTH_URL,
    trustedOrigins: [env.APP_URL],
    advanced: {
        crossSubDomainCookies: {
            enabled: true,
        },
        cookiePrefix: "machina",
    },

    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: "spotify",
                    clientId: env.SPOTIFY_CLIENT_ID,
                    clientSecret: env.SPOTIFY_CLIENT_SECRET,
                    scopes: [
                        "user-read-email",
                        "user-read-recently-played",
                        "user-read-playback-state",
                        "user-read-currently-playing",
                    ],
                    pkce: false,
                    tokenUrl: "https://accounts.spotify.com/api/token",
                    authorizationUrl: "https://accounts.spotify.com/authorize",
                    userInfoUrl: "https://api.spotify.com/v1/me",
                    mapProfileToUser: (profile) => {
                        console.log("hit the custom one");
                        return {
                            id: profile.id,
                            name: profile.display_name,
                            email: profile.email,
                            image: profile.images[0]?.url,
                            emailVerified: false,
                        };
                    },
                },
            ],
        }),
    ],
});
