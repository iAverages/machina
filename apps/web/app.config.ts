import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

import "./src/env-client";

export default defineConfig({
    ssr: true,
    server: {
        preset: "node-server",
        routeRules: {
            "/dan": { redirect: "/p/fp0sllluqyvm69f5ukrc6buv" },
            "/h/**": { redirect: "/p/**" },
        },
        esbuild: {
            options: {
                target: "es2024",
            },
        },
    },
    vite: {
        envPrefix: "PUBLIC_",
        plugins: [tailwindcss()],
    },
});
