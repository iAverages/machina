/// <reference types="vinxi/types/client" />

import { StartClient } from "@tanstack/solid-start";
import { hydrate } from "solid-js/web";
import { client } from "./api/client/client.gen";
import { env } from "./env-client";
import { createRouter } from "./router";

globalThis.$getVibrantPalette = async (src: string) => {
    const vib = await import("node-vibrant/browser");
    return vib.Vibrant.from(src).getPalette();
};

client.setConfig({
    baseUrl: env.PUBLIC_VIDEO_GENERATION_URL,
});

const router = createRouter();

hydrate(() => <StartClient router={router} />, document.body);
