import { QueryClient } from "@tanstack/solid-query";
import { createRouter as createTanStackRouter } from "@tanstack/solid-router";
import posthog from "posthog-js";
import superjson from "superjson";
import { DefaultErrorComponent } from "~/components/default-error-component";
import { DefaultNotFoundComponent } from "~/components/default-not-found-component";
import { routeTree } from "./routeTree.gen";

export const createRouterContext = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            dehydrate: { serializeData: superjson.serialize },
            hydrate: { deserializeData: superjson.deserialize },
            queries: {
                experimental_prefetchInRender: true,
            },
        },
    });

    return {
        queryClient,
    };
};
export type RouterContext = ReturnType<typeof createRouterContext>;

export function createRouter() {
    const context = createRouterContext();

    const router = createTanStackRouter({
        routeTree,
        defaultPreload: "intent",
        // defaultViewTransition: true,
        defaultErrorComponent: DefaultErrorComponent,
        defaultNotFoundComponent: DefaultNotFoundComponent,
        defaultOnCatch: (error) => {
            console.error("error in router:", error);
            posthog.captureException(error);
        },
        scrollRestoration: true,
        context,
    });

    return router;
}

declare module "@tanstack/solid-router" {
    interface Register {
        router: ReturnType<typeof createRouter>;
    }
}
