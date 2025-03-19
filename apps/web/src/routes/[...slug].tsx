import { Meta } from "@solidjs/meta";
import { createAsync, RouteDefinition, RouteSectionProps } from "@solidjs/router";
import { Vibrant } from "node-vibrant/node";
import { Show } from "solid-js";
import { env } from "~/env";
import { trackDataQuery } from "~/utils/get-track-data";

export const route = {
    preload: async (props) => {
        // i hate browsers
        if (!props.params.slug || props.params.slug === "favicon.ico") return;
        await trackDataQuery(props.params.slug);
    },
} satisfies RouteDefinition;

export default function Page(props: RouteSectionProps) {
    const data = createAsync(() => trackDataQuery(props.params.slug!), {
        deferStream: true,
    });

    // TODO: check client bundle isnt fucked from using node version of node-vibrant
    const colors = createAsync(
        async () => {
            const d = data();
            if (!d || !d.data.album.images[0]?.url) return null;
            const palette = await Vibrant.from(d.data.album.images[0].url).getPalette();
            const baseColor = palette.Vibrant?.hex ?? "#000";
            const gradientColor = palette.DarkVibrant?.hex ?? "#fff";

            return { baseColor, gradientColor };
        },
        { deferStream: true },
    );

    return (
        <Show when={data()?.data} fallback={<>couldnt find that song</>}>
            {(track) => (
                <>
                    <Meta property="og:title" content={track().name} />
                    <Meta property="og:description" content={track().artists[0]?.name} />
                    <Meta property="description" content={track().artists[0]?.name} />
                    <Meta
                        property="og:url"
                        content={`${env.PUBLIC_VIDEO_GENERATION_URL}/https:/open.spotify.com/track/${track().id}`}
                    />
                    <Meta property="theme-color" content={colors()?.baseColor ?? "#7e22ce"} />
                    <Meta property="og:image" content={data()?.og + "&baddiscord=true"} />
                    <Meta property="og:type" content="video" />
                    <Meta property="og:video" content={`${env.PUBLIC_VIDEO_GENERATION_URL}/${track().id}.mp4`} />
                    <Meta property="og:video:type" content="video/mp4" />
                    <Meta property="og:video:height" content="300" />
                    <Meta property="og:video:width" content="800" />
                    <Meta
                        property="og:video:secure_url"
                        content={`${env.PUBLIC_VIDEO_GENERATION_URL}/${track().id}.mp4`}
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
                                    <img src={track().album.images[0]?.url} class="object-contain" />
                                </div>
                            </div>

                            <div class="w-1/2 text-white flex flex-col justify-center">
                                <h1 class="text-5xl font-bold mb-4">{track().name}</h1>
                                <p class="text-2xl mb-2">{track().artists[0]?.name}</p>
                                <p class="text-xl mb-6">{track().album.name}</p>
                                <iframe
                                    src={`https://open.spotify.com/embed/track/${track().id}`}
                                    width="50%"
                                    height="80"
                                    allow="encrypted-media"
                                    class="rounded-md"
                                ></iframe>
                            </div>
                        </div>
                        <div class="absolute top-0 right-0 z-0 h-screen">
                            <img
                                src={track().album.images[0]?.url}
                                class="object-contain w-full h-full opacity-25"
                                style={{
                                    "mask-image": "linear-gradient(to right, transparent 40%, black 100%)",
                                    "mask-repeat": "no-repeat",
                                }}
                            />
                        </div>
                    </div>
                </>
            )}
        </Show>
    );
}
