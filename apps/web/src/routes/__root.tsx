import { QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { createRootRouteWithContext, HeadContent, Outlet } from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";
import { onMount, Suspense } from "solid-js";
import appCss from "~/app.css?url";
import type { RouterContext } from "~/router";

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
    head: () => ({
        meta: [
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
        ],
        links: [
            { rel: "stylesheet", href: appCss },
            { rel: "icon", href: "/favicon.ico" },
        ],
    }),
});

function RootComponent() {
    const context = Route.useRouteContext();

    onMount(() => {
        // apparently you can just include <html> tags in the render but
        // it appears to add them twice (our one and the default one?)
        // so doing this instead
        document.getElementsByTagName("html")[0]?.classList.add("dark");
    });

    return (
        <QueryClientProvider client={context().queryClient}>
            {/* needed to include head from routes in ssr */}
            <HeadContent />
            <Outlet />
            <Suspense fallback={"bro"}>
                <TanStackRouterDevtools />
                <SolidQueryDevtools client={context().queryClient} />
            </Suspense>
        </QueryClientProvider>
    );
}
