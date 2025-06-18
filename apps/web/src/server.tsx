import { createStartHandler, defaultStreamHandler, getHeaders } from "@tanstack/solid-start/server";
import type { Vibrant } from "node-vibrant/node";
import { client } from "./api/client/client.gen";
import { env as clientEnv } from "./env-client";
import { createRouter } from "./router";

declare global {
    var $getVibrantPalette: (src: string) => ReturnType<ReturnType<typeof Vibrant.from>["getPalette"]>;
}

globalThis.$getVibrantPalette = async (src: string) => {
    const vib = await import("node-vibrant/node");
    return vib.Vibrant.from(src).getPalette();
};

// this looks weird but we cant call getHeaders() (or other h3 stuff) outside a request context.
let hasSetup = false;
export default createStartHandler({
    createRouter,
})((...args) => {
    if (!hasSetup) {
        hasSetup = true;
        client.setConfig({
            baseUrl: clientEnv.PUBLIC_VIDEO_GENERATION_URL,
            headers: getHeaders(),
        });
    }

    return defaultStreamHandler(...args);
});
