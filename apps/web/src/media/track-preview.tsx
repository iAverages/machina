import { useWindowSize } from "@solid-primitives/resize-observer";
import { Show } from "solid-js";
import { FadeImage } from "~/components/fade-image";
import { GradientBackground } from "~/components/gradient-background";
import { cn } from "~/utils/cn";
import type { TrackData } from "./track";

export const TrackPreviewPage = (props: { track: TrackData }) => {
    const clientSize = useWindowSize();
    const track = () => props.track;

    return (
        <div>
            <div class="flex min-h-screen w-full flex-col">
                <Show when={track().data.data.album.images[0]?.url}>
                    {(albumArt) => <GradientBackground src={albumArt()} />}
                </Show>
                <div class="z-10 min-h-screen">
                    <Show when={track().data.data.album.images[0]?.url}>
                        {(albumArt) => (
                            <div class="sticky top-0 md right-0 pointer-events-none w-full h-fit">
                                <FadeImage
                                    fadeOnMount
                                    src={albumArt()}
                                    opacity="opacity-25"
                                    containerClass="absolute top-0 right-0"
                                    imageWrapperClass="right-0"
                                    class={cn("object-contain", {
                                        "mask-gradient-horizontal h-screen": clientSize.width > clientSize.height,
                                        "mask-gradient-vertical w-screen": clientSize.width <= clientSize.height,
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
                                        src={track().data.data.album.images[0]?.url}
                                        class="object-contain"
                                        alt={`Album art for ${track().data.data.name}`}
                                    />
                                </div>
                            </div>

                            <div class="text-white flex flex-col justify-center w-full max-w-lg">
                                <h1 class="text-5xl font-bold mb-4">{track().data.data.name}</h1>
                                <p class="text-2xl mb-2">{track().data.data.artists[0]?.name}</p>
                                <p class="text-xl mb-6">{track().data.data.album.name}</p>
                                <iframe
                                    src={`https://open.spotify.com/embed/track/${track().data.data.id}`}
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
        </div>
    );
};
