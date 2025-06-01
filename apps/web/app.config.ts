import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/solid-start/config";
import devtools from "solid-devtools/vite";
import icons from "unplugin-icons/vite";
import tsConfigPaths from "vite-tsconfig-paths";

import "./src/env-client";

export default defineConfig({
    tsr: { appDirectory: "src", apiBase: "/iapi" },
    server: {
        preset: "node-server",
        routeRules: {
            "/dan": { redirect: { to: "/p/fp0sllluqyvm69f5ukrc6buv", statusCode: 302 } },
            "/h/**": { redirect: { to: "/p/**", statusCode: 302 } },
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
        devServer: {},
    },
    vite: {
        envPrefix: "PUBLIC_",
        server: { allowedHosts: ["belle-extending-pas-boc.trycloudflare.com"] },
        plugins: [
            devtools(),
            tailwindcss(),
            icons({
                compiler: "solid",
                jsx: "react",
            }),
            tsConfigPaths({
                projects: ["./tsconfig.json"],
            }),
        ],
    },
});
