import { betterAuth } from "better-auth";
import { genericOAuth, openAPI } from "better-auth/plugins";
import { createPool } from "mysql2/promise";
import { env } from "./env";
import { removeTrailingSlash } from "./utils";

export const auth = betterAuth({
    database: createPool({
        uri: env.DATABASE_URL,
    }),
    baseURL: env.AUTH_URL,
    trustedOrigins: [removeTrailingSlash(env.APP_URL)],
    advanced: {
        // TODO: setup prefix for deployment type (i.e prod vs dev)
        cookiePrefix: "machina",
    },

    plugins: [
        openAPI(),
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
