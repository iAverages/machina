import { createFileRoute, notFound, redirect } from "@tanstack/solid-router";
import { trackDataQuery } from "~/utils/get-track-data";

export const Route = createFileRoute("/direct/$")({
    loader: async ({ params }) => {
        if (!params._splat || params._splat === "favicon.ico") throw notFound();

        const song = await trackDataQuery({ data: { slug: params._splat } });
        if (!song || !song.data) throw notFound();
        throw redirect({
            href: song.data.og,
        });
    },
});
