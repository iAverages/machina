import { useWindowSize } from "@solid-primitives/resize-observer";
import { createFileRoute, notFound } from "@tanstack/solid-router";
import { createEffect, For, Match, Show, Switch } from "solid-js";
import { FadeImage } from "~/components/fade-image";
import { GradientBackground } from "~/components/gradient-background";
import { env } from "~/env-client";
import { cn } from "~/utils/cn";
import { type SongData, trackDataQuery } from "~/utils/get-track-data";

const songHead = (track: SongData) => [
    { title: "machina" },
    { property: "og:title", content: track.data.name },
    { property: "og:description", content: track.data.artists[0]?.name },
    { property: "description", content: track.data.artists[0]?.name },
    {
        property: "og:url",
        content: `${env.PUBLIC_VIDEO_GENERATION_URL}/https:/open.spotify.com/track/${track.data.id}`,
    },
    // { property: "theme-color", content: colors?.baseColor ?? "#7e22ce" },
    { property: "theme-color", content: "#7e22ce" },
    { property: "og:image", content: `${track.og}&baddiscord=true` },
    { property: "og:type", content: "video" },
    { property: "og:video", content: `${env.PUBLIC_VIDEO_GENERATION_URL}/${track.data.id}.mp4` },
    { property: "og:video:type", content: "video/mp4" },
    { property: "og:video:height", content: "300" },
    { property: "og:video:width", content: "800" },
    {
        property: "og:video:secure_url",
        content: `${env.PUBLIC_VIDEO_GENERATION_URL}/${track.data.id}.mp4`,
    },
];

const prereleaseHead = (data: unknown) => [];

export const Route = createFileRoute("/$")({
    component: RouteComponent,
    loader: async ({ params }) => {
        if (!params._splat) throw notFound();
        console.log("fetching track data");
        const song = await trackDataQuery({ data: { slug: params._splat } });
        console.log({ song });
        return song;
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? (loaderData.meta ? prereleaseHead(loaderData.meta) : songHead(loaderData.data)) : [],
    }),
});

function RouteComponent() {
    const data = Route.useLoaderData();

    createEffect(() => {
        console.log("data", data());
    });
    // const colors = createAsync(
    //     async () => {
    //         const d = data();
    //         if (!d) return null;
    //         let artUrl: string | undefined = undefined;
    //         if (d.type === "track") artUrl = d.data?.data.album.images[0]?.url;
    //         else if (d.type === "prerelease") artUrl = d.meta.twitter.image;
    //         if (!artUrl) return null;
    //
    //         // const palette = await globalThis.$getVibrantPalette(artUrl);
    //         // const baseColor = palette.Vibrant?.hex ?? "#000";
    //         // const gradientColor = palette.DarkVibrant?.hex ?? "#fff";
    //         // return { baseColor, gradientColor };
    //         return { baseColor: undefined, gradientColor: undefined };
    //     },
    //     { deferStream: true },
    // );

    const clientSize = useWindowSize();

    return (
        <Show when={data()} fallback={<>couldnt find that song</>}>
            {(info) => (
                <Switch>
                    <Match when={info().meta}>
                        {(track) => (
                            <>
                                {/* <For each={Object.entries(track().twitter)}> */}
                                {/*     {([prop, content]) => <Meta name={`twitter:${prop}`} content={content} />} */}
                                {/* </For> */}
                                {/**/}
                                {/* <For each={Object.entries(track().og)}> */}
                                {/*     {([prop, content]) => <Meta property={`og:${prop}`} content={content} />} */}
                                {/* </For> */}
                                {/* <Meta property="theme-color" content={colors()?.baseColor ?? "#7e22ce"} /> */}
                            </>
                        )}
                    </Match>
                    <Match when={info().data}>
                        {(track) => (
                            <div class="flex min-h-screen w-full flex-col">
                                {/* <Show when={track().data.album.images[0]?.url}> */}
                                {/*     {(albumArt) => <GradientBackground src={albumArt()} />} */}
                                {/* </Show> */}
                                <div class="z-10 min-h-screen">
                                    <Show when={track().data.album.images[0]?.url}>
                                        {(albumArt) => (
                                            <div class="sticky top-0 md right-0 pointer-events-none w-full h-fit">
                                                <FadeImage
                                                    fadeOnMount
                                                    src={albumArt()}
                                                    opacity="opacity-25"
                                                    containerClass="absolute top-0 right-0"
                                                    imageWrapperClass="right-0"
                                                    class={cn("object-contain", {
                                                        "mask-gradient-horizontal h-screen":
                                                            clientSize.width > clientSize.height,
                                                        "mask-gradient-vertical w-screen":
                                                            clientSize.width <= clientSize.height,
                                                    })}
                                                    aria-hidden
                                                />
                                            </div>
                                        )}
                                    </Show>

                                    <div class="flex flex-col items-center justify-center h-screen p-12">
                                        <div class="flex w-full flex-col lg:flex-row items-center z-10 gap-12 md:gap-6">
                                            <div class="flex items-center justify-center w-full h-full lg:max-w-1/2">
                                                <div class="flex items-center justify-center w-fit h-full rounded-xl overflow-hidden">
                                                    <img
                                                        src={track().data.album.images[0]?.url}
                                                        class="object-contain"
                                                        alt={`Album art for ${track().data.name}`}
                                                    />
                                                </div>
                                            </div>

                                            <div class="text-white flex flex-col justify-center w-full max-w-lg">
                                                <h1 class="text-5xl font-bold mb-4">{track().data.name}</h1>
                                                <p class="text-2xl mb-2">{track().data.artists[0]?.name}</p>
                                                <p class="text-xl mb-6">{track().data.album.name}</p>
                                                <iframe
                                                    src={`https://open.spotify.com/embed/track/${track().data.id}`}
                                                    width="100%"
                                                    height="100"
                                                    allow="encrypted-media"
                                                    class="rounded-md max-w-md w-full"
                                                    title="spotify embed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Match>
                </Switch>
            )}
        </Show>
    );
}
