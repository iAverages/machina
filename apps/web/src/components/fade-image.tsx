import { createEffect, createSignal, Show, splitProps, type JSX } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { cn } from "~/utils/cn";

export type FadeImageProps = JSX.ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    style?: JSX.CSSProperties;
    containerClass?: string;
    imageWrapperClass?: string;
    opacity?: number;
};

const FADE_TIME_MS = 300;

export const FadeImage = (props: FadeImageProps) => {
    const [local, imageProps] = splitProps(props, ["containerClass", "src", "imageWrapperClass"]);
    const [imageA, setImageA] = createSignal(local.src);
    const [imageB, setImageB] = createSignal<string | null>(null);
    const [showA, setShowA] = createSignal(true);

    createEffect(() => {
        console.log(local.src);
        if (local.src !== imageA()) {
            // load image before switching
            // TODO: look at caching the next images
            const img = new Image();
            img.src = local.src;
            img.onload = () => {
                const nextA = setShowA((p) => !p);
                if (nextA) {
                    setImageA(props.src);
                } else {
                    setImageB(props.src);
                }
            };
        }
    });

    return (
        <div class={cn("top-0 w-full h-full right-0", local.containerClass)}>
            <div class="relative w-full h-full">
                <Presence exitBeforeEnter>
                    <Show when={showA()}>
                        <div class={cn("absolute w-fit", local.imageWrapperClass)}>
                            <Motion.img
                                initial={{ opacity: imageProps.opacity ?? 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: FADE_TIME_MS / 1000 }}
                                {...imageProps}
                                src={imageA()}
                            />
                        </div>
                    </Show>
                </Presence>
                <Presence exitBeforeEnter>
                    <Show when={!showA()}>
                        <div class={cn("absolute w-fit h-fit", local.imageWrapperClass)}>
                            <Motion.img
                                initial={{ opacity: 0 }}
                                animate={{ opacity: imageProps.opacity ?? 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: FADE_TIME_MS / 1000 }}
                                {...imageProps}
                                src={imageB() ?? ""}
                            />
                        </div>
                    </Show>
                </Presence>
            </div>
        </div>
    );
};
