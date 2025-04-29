// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

import type { Vibrant } from "node-vibrant/node";
declare global {
    var $getVibrantPalette: (src: string) => ReturnType<ReturnType<typeof Vibrant.from>["getPalette"]>;
}

globalThis.$getVibrantPalette = async (src: string) => {
    const vib = await import("node-vibrant/node");
    return vib.Vibrant.from(src).getPalette();
};

import "./env-client";
export default createHandler(() => (
    <StartServer
        document={({ assets, children, scripts }) => (
            <html lang="en" class="dark">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" />
                    {assets}
                </head>
                <body>
                    <div id="app">{children}</div>
                    {scripts}
                </body>
            </html>
        )}
    />
));
