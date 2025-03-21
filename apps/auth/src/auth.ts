import { betterAuth } from "better-auth";
import { betterFetch } from "better-auth/client";
import { genericOAuth } from "better-auth/plugins";
import { SpotifyProfile } from "better-auth/social-providers";
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
            scope: ["user-read-recently-played", "user-read-playback-state", "user-read-currently-playing"],
        },
    },

    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: "spotify",
                    clientId: process.env.SPOTIFY_CLIENT_ID as string,
                    clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
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
