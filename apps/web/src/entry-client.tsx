// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

globalThis.$getVibrantPalette = async (src: string) => {
    const vib = await import("node-vibrant/browser");
    return vib.Vibrant.from(src).getPalette();
};

// biome-ignore lint/style/noNonNullAssertion: will always exist
mount(() => <StartClient />, document.getElementById("app")!);
