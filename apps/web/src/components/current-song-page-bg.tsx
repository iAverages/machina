import { useWindowSize } from "@solid-primitives/resize-observer";
import { type JSX, Show } from "solid-js";
import { cn } from "~/utils/cn";
import { FadeImage } from "./fade-image";
import { GradientBackground } from "./gradient-background";

export const CurrentSongBg = (props: { albumArt?: string | null; children: JSX.Element }) => {
    const clientSize = useWindowSize();

    return (
        <div class="flex min-h-screen w-full flex-col">
            <Show when={props.albumArt}>{(albumArt) => <GradientBackground src={albumArt()} />}</Show>
            <div class="bg-background/40 z-10 min-h-dvh">
                <Show when={props.albumArt}>
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

                <div class="flex flex-col items-center">
                    <main class="flex flex-1 flex-col gap-6 p-6 md:gap-8 container">{props.children}</main>
                </div>
            </div>
        </div>
    );
};
