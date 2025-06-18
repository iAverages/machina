import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import devtools from "solid-devtools/vite";
import icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

import "./src/env-client";

export default defineConfig({
    build: { target: "esnext" },
    esbuild: {
        target: "esnext",
    },
    server: {
        // TODO: find better replacement, for now have just
        // created the routes with a redirect in the loader
        // routeRules: {
        //     "/dan": "/p/fp0sllluqyvm69f5ukrc6buv",
        //     "/h/**": "/p/**",
        // },
        proxy: {
            "/api/auth": "http://localhost:3002",
            "/api": "http://localhost:3001",
        },
    },
    envPrefix: "PUBLIC_",
    plugins: [
        devtools(),
        tanstackStart({
            target: "node-server",
            tsr: {
                srcDirectory: "src",
            },
        }),
        tailwindcss(),
        icons({
            compiler: "solid",
            jsx: "react",
        }),
        tsConfigPaths({
            projects: ["./tsconfig.json"],
        }),
    ],
});
