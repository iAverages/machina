import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        API_URL: z.string().url(),
        APP_URL: z.string().url(),
    },

    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
