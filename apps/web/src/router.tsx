import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { createRouter as createTanStackRouter } from "@tanstack/solid-router";
import { DefaultErrorComponent } from "~/components/default-error-component";
import { routeTree } from "./routeTree.gen";

export const createRouterContext = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
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
        defaultNotFoundComponent: () => <div>bad not found</div>,
        defaultOnCatch: (error) => {
            console.error("render onCatch:", error);
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
