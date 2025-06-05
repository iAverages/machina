import { getRouterManifest } from "@tanstack/solid-start/router-manifest";
import { createStartHandler, defaultStreamHandler, getHeaders } from "@tanstack/solid-start/server";
import type { Vibrant } from "node-vibrant/node";
import { client } from "./api/client/client.gen";
import { env as clientEnv } from "./env-client";
import { env } from "./env-server";
import { createRouter } from "./router";

declare global {
    var $getVibrantPalette: (src: string) => ReturnType<ReturnType<typeof Vibrant.from>["getPalette"]>;
}

globalThis.$getVibrantPalette = async (src: string) => {
    const vib = await import("node-vibrant/node");
    return vib.Vibrant.from(src).getPalette();
};

client.setConfig({
    baseUrl:
        typeof window === "undefined"
            ? (env.API_URL ?? clientEnv.PUBLIC_VIDEO_GENERATION_URL)
            : clientEnv.PUBLIC_VIDEO_GENERATION_URL,
    headers: getHeaders(),
});

export default createStartHandler({
    // @ts-expect-error - why is tsc erroring here?
    createRouter,
    getRouterManifest,
})(defaultStreamHandler);
