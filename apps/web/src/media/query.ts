import { createServerFn } from "@tanstack/solid-start";
import { z } from "zod";
import { env as envClient } from "~/env-client";
import { type MediaType, mediaTypes } from "~/media";
import { mediaTypeProcessor } from "~/media/processors";

export const getMediaIdFromSlug = (slug: string) => {
    try {
        // Old nextjs web app would redirect from /https:// to /https:/
        const url = slug.startsWith("https:/open") ? new URL(slug.replace("https:/", "https://")) : new URL(slug);

        const secondSlash = url.pathname.indexOf("/", 2);
        const id = url.pathname.substring(secondSlash + 1);
        const type = url.pathname.substring(1, secondSlash) as MediaType;

        if (!mediaTypes.includes(type)) return null;

        return { id, type };
    } catch {
        // simple base62 + 22 char limit check
        if (/^[a-zA-Z0-9]{22}$/.test(slug)) return { id: slug, type: "track" as const };
        return null;
    }
};

export const mediaDataQuery = createServerFn({
    method: "GET",
    response: "data",
})
    .validator((data) => z.object({ slug: z.string(), preload: z.boolean().default(false) }).parse(data))
    .handler(async ({ data: { slug, preload } }) => {
        const mediaInfo = getMediaIdFromSlug(slug);
        if (!mediaInfo) return null;

        const data = await mediaTypeProcessor[mediaInfo.type](mediaInfo.id);

        // if track and preload, this server function should wait until we have finished generating the video
        // before it responses to the request. This is basically used for discord embeds to stop them
        // from breaking if the video is not ready
        if (mediaInfo.type === "track") {
            preload && (await fetch(`${envClient.PUBLIC_VIDEO_GENERATION_URL}/api/generate/video/${mediaInfo.id}`));
        }

        return data;
    });

export type MediaData = Awaited<ReturnType<typeof mediaDataQuery>>;
