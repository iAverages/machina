import type { APIEvent } from "@solidjs/start/server";
import { createAPIFileRoute } from "@tanstack/solid-start/api";
import { Vibrant } from "node-vibrant/node";

export const APIRoute = createAPIFileRoute("/iapi/color-palette")({
    GET: async ({ request: req }) => {
        try {
            const { searchParams } = new URL(req.url as string, "http://localhost:3000");
            const albumArt = searchParams.get("url");

            if (!albumArt) {
                return new Response(
                    JSON.stringify({
                        baseColor: null,
                        gradientColor: null,
                    }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        status: 400,
                    },
                );
            }

            const palette = await Vibrant.from(albumArt).getPalette();
            const baseColor = palette.Vibrant?.hex ?? "#000";
            const gradientColor = palette.DarkVibrant?.hex ?? "#fff";

            console.log({
                baseColor,
                gradientColor,
            });
            return new Response(
                JSON.stringify({
                    baseColor,
                    gradientColor,
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
        } catch (e) {
            console.log(e);
            return new Response(
                JSON.stringify({
                    baseColor: null,
                    gradientColor: null,
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 500,
                },
            );
        }
    },
});
