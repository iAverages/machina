import { env } from "~/env-client";
import { client } from "./client/client.gen";

client.setConfig({
    baseUrl: env.PUBLIC_VIDEO_GENERATION_URL,
});
