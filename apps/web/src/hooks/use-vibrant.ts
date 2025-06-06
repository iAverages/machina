import { useQuery } from "@tanstack/solid-query";
import { createServerFn } from "@tanstack/solid-start";
import { Vibrant } from "node-vibrant/node";
import type { Accessor } from "solid-js";
import { DEFAULT_GRADIENT } from "~/utils/consts";

export const vibrant = createServerFn({
    method: "GET",
    response: "data",
})
    .validator((data: { src: string }) => data)
    .handler(async ({ data: { src } }) => {
        try {
            const albumArt = src;

            if (!albumArt) {
                return {
                    gradientColor: DEFAULT_GRADIENT.from,
                    baseColor: DEFAULT_GRADIENT.to,
                };
            }

            const palette = await Vibrant.from(albumArt).getPalette();
            const gradientColor = palette.DarkVibrant?.hex ?? DEFAULT_GRADIENT.from;
            const baseColor = palette.Vibrant?.hex ?? DEFAULT_GRADIENT.to;

            return {
                gradientColor,
                baseColor,
            };
        } catch (e) {
            console.log(e);
            return {
                gradientColor: DEFAULT_GRADIENT.from,
                baseColor: DEFAULT_GRADIENT.to,
            };
        }
    });

export const vibrantQueryOptions = (src: string) => ({
    queryKey: ["color-palette", src],
    deferStream: true,
    queryFn: () => {
        return vibrant({ data: { src } });
    },
});

export const useVibrant = (props: { src: Accessor<string> }) => {
    const data = useQuery(() => vibrantQueryOptions(props.src()));

    return () =>
        data.data ?? {
            gradientColor: DEFAULT_GRADIENT.from,
            baseColor: DEFAULT_GRADIENT.to,
        };
};
