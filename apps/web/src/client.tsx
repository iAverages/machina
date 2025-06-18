/// <reference types="vite/client" />
import { StartClient } from "@tanstack/solid-start";
import posthog from "posthog-js";
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

posthog.init("phc_1iE1HrbynKxnVyMSP0pLwJvAjJ2lk4PVQ8Up4v1hP3Y", {
    api_host: "https://eu.i.posthog.com",
    // we handle page views manaully at the router level
    capture_pageview: false,
    autocapture: true,
    defaults: "2025-05-24",
});

const router = createRouter();

const capturePageView = (pathname: string) => {
    posthog.capture("$pageview", {
        current_url: window.location.href,
        pathname,
        search: window.location.search,
        hash: window.location.hash,
        referrer: document.referrer,
    });
    posthog.register({
        current_url: window.location.href,
    });
};

// set up listener for navigation changes to track page views
router.subscribe("onBeforeNavigate", (navigation) => {
    capturePageView(navigation.toLocation.pathname);
});

capturePageView(window.location.pathname);

hydrate(() => <StartClient router={router} />, document.body);
