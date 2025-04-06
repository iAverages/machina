import { QueryClientProvider } from "@tanstack/solid-query";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import "@fontsource-variable/noto-sans-jp";
import "@fontsource-variable/inter";

import "~/api";
import "./app.css";
import { QueryClient } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";

export default function App() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                experimental_prefetchInRender: true,
            },
        },
    });
    return (
        <Router
            root={(props) => (
                <MetaProvider>
                    <Title>machina</Title>
                    <QueryClientProvider client={queryClient}>
                        <Suspense>{props.children}</Suspense>
                        <Suspense>
                            <SolidQueryDevtools />
                        </Suspense>
                    </QueryClientProvider>
                </MetaProvider>
            )}
        >
            <FileRoutes />
        </Router>
    );
}
