import { Meta } from "@solidjs/meta";
import { createAsync, type RouteDefinition, type RouteSectionProps } from "@solidjs/router";
import { Vibrant } from "node-vibrant/node";
import { For, Match, Show, Switch } from "solid-js";
import { env } from "~/env-client";
import { trackDataQuery } from "~/utils/get-track-data";

export const route = {
    preload: async (props) => {
        // i hate browsers
        if (!props.params.slug || props.params.slug === "favicon.ico") return;
        await trackDataQuery(props.params.slug);
    },
} satisfies RouteDefinition;

export default function Page(props: RouteSectionProps) {
    // biome-ignore lint/style/noNonNullAssertion: can this ever not be a string?
    const data = createAsync(() => trackDataQuery(props.params.slug!), {
        deferStream: true,
    });

    // TODO: check client bundle isnt fucked from using node version of node-vibrant
    const colors = createAsync(
        async () => {
            const d = data();
            if (!d) return null;
            let artUrl: string | undefined = undefined;
            if (d.type === "track") artUrl = d.data?.data.album.images[0]?.url;
            else if (d.type === "prerelease") artUrl = d.meta.twitter.image;
            if (!artUrl) return null;

            const palette = await Vibrant.from(artUrl).getPalette();
            const baseColor = palette.Vibrant?.hex ?? "#000";
            const gradientColor = palette.DarkVibrant?.hex ?? "#fff";

            return { baseColor, gradientColor };
        },
        { deferStream: true },
    );

    return (
        <Show when={data()} fallback={<>couldnt find that song</>}>
            {(info) => (
                <Switch>
                    <Match when={info().meta}>
                        {(track) => (
                            <>
                                <For each={Object.entries(track().twitter)}>
                                    {([prop, content]) => <Meta name={`twitter:${prop}`} content={content} />}
                                </For>

                                <For each={Object.entries(track().og)}>
                                    {([prop, content]) => <Meta property={`og:${prop}`} content={content} />}
                                </For>
                                <Meta property="theme-color" content={colors()?.baseColor ?? "#7e22ce"} />
                            </>
                        )}
                    </Match>
                    <Match when={info().data}>
                        {(track) => (
                            <>
                                <Meta property="og:title" content={track().data.name} />
                                <Meta property="og:description" content={track().data.artists[0]?.name} />
                                <Meta property="description" content={track().data.artists[0]?.name} />
                                <Meta
                                    property="og:url"
                                    content={`${env.PUBLIC_VIDEO_GENERATION_URL}/https:/open.spotify.com/track/${track().data.id}`}
                                />
                                <Meta property="theme-color" content={colors()?.baseColor ?? "#7e22ce"} />
                                <Meta property="og:image" content={`${track().og}&baddiscord=true`} />
                                <Meta property="og:type" content="video" />
                                <Meta
                                    property="og:video"
                                    content={`${env.PUBLIC_VIDEO_GENERATION_URL}/${track().data.id}.mp4`}
                                />
                                <Meta property="og:video:type" content="video/mp4" />
                                <Meta property="og:video:height" content="300" />
                                <Meta property="og:video:width" content="800" />
                                <Meta
                                    property="og:video:secure_url"
                                    content={`${env.PUBLIC_VIDEO_GENERATION_URL}/${track().data.id}.mp4`}
                                />
                                <div
                                    class="flex h-screen relative"
                                    style={{
                                        background: `linear-gradient(45deg, ${colors()?.baseColor}, ${colors()?.gradientColor})`,
                                    }}
                                >
                                    <div class="flex w-full z-10">
                                        <div class="flex items-center justify-center w-3/4 h-full">
                                            <div class="flex items-center justify-center w-fit h-fit rounded-xl overflow-hidden">
                                                <img
                                                    src={track().data.album.images[0]?.url}
                                                    class="object-contain"
                                                    alt={`Album art for ${track().data.name}`}
                                                />
                                            </div>
                                        </div>

                                        <div class="w-1/2 text-white flex flex-col justify-center">
                                            <h1 class="text-5xl font-bold mb-4">{track().data.name}</h1>
                                            <p class="text-2xl mb-2">{track().data.artists[0]?.name}</p>
                                            <p class="text-xl mb-6">{track().data.album.name}</p>
                                            <iframe
                                                src={`https://open.spotify.com/embed/track/${track().data.id}`}
                                                width="50%"
                                                height="80"
                                                allow="encrypted-media"
                                                class="rounded-md"
                                                title="spotify embed"
                                            />
                                        </div>
                                    </div>
                                    <div class="absolute top-0 right-0 z-0 h-screen">
                                        <img
                                            src={track().data.album.images[0]?.url}
                                            class="object-contain w-full h-full opacity-25"
                                            style={{
                                                "mask-image": "linear-gradient(to right, transparent 40%, black 100%)",
                                                "mask-repeat": "no-repeat",
                                            }}
                                            aria-hidden
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </Match>
                </Switch>
            )}
        </Show>
    );
}
