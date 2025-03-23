import { createSignal, onCleanup } from "solid-js";

export type UseInViewOptions = {
    threshold?: number | number[];
    rootMargin?: string;
    root?: Element | null;
    once?: boolean;
};

export const useInView = (onVisible?: () => void, onHidden?: () => void, options: UseInViewOptions = {}) => {
    const [isVisible, setIsVisible] = createSignal(false);
    const [firstVisibleAt, setFirstVisibleAt] = createSignal<number | null>(null);
    let element: HTMLElement | null = null;
    let observer: IntersectionObserver | null = null;

    const defaultOptions = {
        threshold: 0,
        rootMargin: "0px",
        root: null,
        once: false,
    } satisfies UseInViewOptions;

    const mergedOptions = { ...defaultOptions, ...options };

    const setupObserver = (el: HTMLElement) => {
        element = el;

        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const isElementVisible = entry.isIntersecting;
                    setIsVisible(isElementVisible);

                    if (isElementVisible) {
                        if (firstVisibleAt() === null) {
                            setFirstVisibleAt(Date.now());
                        }

                        onVisible?.();

                        if (mergedOptions.once && observer) {
                            observer.disconnect();
                        }
                    } else {
                        onHidden?.();
                    }
                }
            },
            {
                root: mergedOptions.root,
                rootMargin: mergedOptions.rootMargin,
                threshold: mergedOptions.threshold,
            },
        );

        observer.observe(el);
    };

    onCleanup(() => {
        if (observer) {
            observer.disconnect();
        }
    });

    return {
        ref: setupObserver,
        isVisible,
        firstVisibleAt,
    };
};
