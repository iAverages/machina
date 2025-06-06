import { createFileRoute, notFound, redirect } from "@tanstack/solid-router";
import { MediaType } from "~/media";
import { mediaDataQuery } from "~/media/query";

export const Route = createFileRoute("/direct/$")({
    loader: async ({ params }) => {
        if (!params._splat || params._splat === "favicon.ico") throw notFound();

        const song = await mediaDataQuery({ data: { slug: params._splat } });
        if (!song || !song.data || song.data.type !== MediaType.Track) throw notFound();
        throw redirect({
            href: song.data.data.og,
        });
    },
});
