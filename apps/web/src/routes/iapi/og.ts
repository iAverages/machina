import satori from "satori";
import { OpenGraph } from "@machina/og";
import type { APIEvent } from "@solidjs/start/server";
import { Vibrant } from "node-vibrant/node";
import { Resvg } from "@resvg/resvg-js";
import { getFont } from "~/utils/og-font";
import { createAPIFileRoute } from "@tanstack/solid-start/api";

const inter = await getFont({
    family: "Inter",
    weights: [400, 700] as const,
});

const notoSans = await getFont({
    family: "Noto Sans JP",
    weights: [400, 700] as const,
});

export const APIRoute = createAPIFileRoute("/iapi/og")({
    GET: async ({ request: req }) => {
        try {
            const { searchParams } = new URL(req.url as string, "http://localhost:3000");
            const albumArt = searchParams.get("albumArt");
            const artist = searchParams.get("artist");
            const songName = searchParams.get("songName");

            if (!albumArt || !artist || !songName) {
                return new Response("bad request, missing required options", {
                    status: 400,
                });
            }

            const palette = await Vibrant.from(albumArt).getPalette();
            const baseColor = palette.Vibrant?.hex ?? "#000";
            const gradientColor = palette.DarkVibrant?.hex ?? "#fff";

            const svgComp = OpenGraph({
                baseColor,
                gradientColor,
                albumArt,
                artist,
                songName,
            });

            const svgData = await satori(svgComp, {
                width: 800,
                height: 300,
                fonts: [
                    { name: "Inter", data: inter[400], weight: 400 },
                    { name: "Inter", data: inter[700], weight: 700 },
                    { name: "Noto Sans JP", data: notoSans[400], weight: 400 },
                    { name: "Noto Sans JP", data: notoSans[700], weight: 700 },
                ],
            });

            const resvg = new Resvg(svgData, {});
            const pngData = resvg.render();
            const pngBuffer = pngData.asPng();

            return new Response(pngBuffer, {
                headers: {
                    "Content-Type": "image/png",
                    "cache-control": "public, max-age=31536000, immutable",
                },
            });
        } catch (e) {
            console.log(e);
            return new Response("error", { status: 500 });
        }
    },
});
