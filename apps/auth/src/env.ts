import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string(),

        API_URL: z.string().url(),
        APP_URL: z.string().url(),
        AUTH_URL: z.string().url(),

        SPOTIFY_CLIENT_ID: z.string(),
        SPOTIFY_CLIENT_SECRET: z.string(),
    },

    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
