import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import "@fontsource-variable/noto-sans-jp";
import "@fontsource-variable/inter";

import "./app.css";

export default function App() {
    return (
        <Router
            root={(props) => (
                <MetaProvider>
                    <Title>machina</Title>
                    <Suspense>{props.children}</Suspense>
                </MetaProvider>
            )}
        >
            <FileRoutes />
        </Router>
    );
}
