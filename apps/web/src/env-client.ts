import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    clientPrefix: "PUBLIC_",

    client: {
        PUBLIC_VIDEO_GENERATION_URL: z.string().url(),
        PUBLIC_APP_URL: z.string().url(),
        PUBLIC_AUTH_URL: z.string().url(),
    },
    // @ts-expect-error - why break now
    runtimeEnv: import.meta.env,
    emptyStringAsUndefined: true,
});
