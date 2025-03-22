import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

import "./src/env-client";

export default defineConfig({
    ssr: true,
    server: {
        preset: "node-server",
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
