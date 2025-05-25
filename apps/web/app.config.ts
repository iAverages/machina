import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import icons from "unplugin-icons/vite";

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
        devProxy: {
            "/api/auth/": {
                target: "http://localhost:3002/api/auth",
            },
            "/api/": {
                target: "http://localhost:3001/api",
            },
        },
    },
    vite: {
        envPrefix: "PUBLIC_",
        plugins: [
            tailwindcss(),
            icons({
                compiler: "solid",
                jsx: "react",
            }),
        ],
    },
});
