import { env } from "~/env-client";
import { Configuration, DefaultApi } from "./client";

export const api = new DefaultApi(
    new Configuration({
        basePath: env.PUBLIC_VIDEO_GENERATION_URL,
    }),
);
