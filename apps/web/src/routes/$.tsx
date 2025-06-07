import { useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, notFound } from "@tanstack/solid-router";
import { onMount } from "solid-js";
import { unwrap } from "solid-js/store";
import { ExternalNavigate } from "~/components/helpers/external-navigate";
import { vibrantQueryOptions } from "~/hooks/use-vibrant";
import { MediaType } from "~/media";
import { mediaDataQuery } from "~/media/query";
import { TrackPreviewPage } from "~/media/track-preview";
import { unreachable } from "~/utils/switch";

export const Route = createFileRoute("/$")({
    component: RouteComponent,
    loader: async ({ params, context: { queryClient } }) => {
        if (!params._splat) throw notFound();
        // TODO: only preload if request is from discord
        const media = await mediaDataQuery({ data: { slug: params._splat, preload: true } });
        if (!media) throw notFound();

        // temp work around until we can ssr the query client correctly
        if (media.data.type === "track") {
            const src = media.data.data.data.album.images[0]?.url;
            if (src) {
                const ssrQueryData = await queryClient.ensureQueryData(vibrantQueryOptions(src));
                return { media, ssrQueryData, ssrQueryDataProps: src };
            }
        }

        return { media };
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? loaderData.media.meta : [],
    }),
});

function RouteComponent() {
    const loader = Route.useLoaderData();
    const queryClient = useQueryClient();

    // temp work around until we can ssr the query client correctly
    onMount(() => {
        const ssrQueryData = loader().ssrQueryData;
        const ssrQueryProps = loader().ssrQueryDataProps;
        if (ssrQueryData && ssrQueryProps) {
            queryClient.setQueryData(vibrantQueryOptions(ssrQueryProps).queryKey, ssrQueryData);
        }
    });

    const Comp = () => {
        const data = unwrap(loader()).media;
        const type = data.data.type;
        switch (type) {
            case MediaType.Track: {
                return <TrackPreviewPage track={data.data} />;
            }
            case MediaType.Prerelease: {
                return <ExternalNavigate href={`https://open.spotify.com/prerelease/${data.data.id}`} />;
            }

            case MediaType.Album: {
                return <ExternalNavigate href={`https://open.spotify.com/album/${data.data.id}`} />;
            }
            default:
                return unreachable(type, "missing case for media preview");
        }
    };

    return <Comp />;
}
