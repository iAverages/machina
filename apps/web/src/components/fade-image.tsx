import { createEffect, createSignal, onMount, splitProps, type JSX } from "solid-js";
import { cn } from "~/utils/cn";

export type FadeImageProps = JSX.ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    style?: JSX.CSSProperties;
    containerClass?: string;
    imageWrapperClass?: string;
    opacity?: string;
    fadeOnMount?: boolean;
};

export const FadeImage = (props: FadeImageProps) => {
    const [local, imageProps] = splitProps(props, [
        "containerClass",
        "src",
        "imageWrapperClass",
        "opacity",
        "fadeOnMount",
    ]);
    const [imageA, setImageA] = createSignal(local.src);
    const [imageB, setImageB] = createSignal<string>(local.src);

    const [isMounted, setIsMounted] = createSignal(!local.fadeOnMount);
    onMount(() => setIsMounted(true));

    const [showA, setShowA] = createSignal(true);

    createEffect(() => {
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
        <div
            class={cn(
                "w-full opacity-0 transition-opacity duration-300",
                local.containerClass,
                isMounted() && "opacity-100",
            )}
        >
            <div class="relative w-full">
                <div class={cn("absolute w-fit h-fit", local.imageWrapperClass)}>
                    <img
                        aria-hidden
                        class={cn("transition-opacity duration-300", imageProps.class, {
                            "opacity-0": !showA(),
                            [local.opacity ?? ""]: showA(),
                        })}
                        src={imageA()}
                    />
                </div>
                <div class={cn("absolute w-fit h-fit", local.imageWrapperClass)}>
                    <img
                        aria-hidden
                        class={cn("transition-opacity duration-300", imageProps.class, {
                            "opacity-0": showA(),
                            [local.opacity ?? ""]: !showA(),
                        })}
                        src={imageB()}
                    />
                </div>
            </div>
        </div>
    );
};
