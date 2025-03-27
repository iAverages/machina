import { query } from "@solidjs/router";
import { Vibrant } from "node-vibrant/node";

export const getColorPalette = query(async (src: string) => {
    "use server";
    const palette = await Vibrant.from(src).getPalette();
    const baseColor = palette.LightVibrant?.hex ?? "#000";
    const gradientColor = palette.DarkVibrant?.hex ?? "#fff";

    return { baseColor, gradientColor };
}, "color-palette");
