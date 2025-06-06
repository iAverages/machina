import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        SPOTIFY_CLIENT_ID: z.string(),
        SPOTIFY_CLIENT_SECRET: z.string(),

        APP_URL: z.string().url(),
        API_URL: z.string().url(),
        AUTH_URL: z.string().url(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
