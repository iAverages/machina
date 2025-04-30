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
    },
    vite: {
        envPrefix: "PUBLIC_",
        plugins: [
            tailwindcss(),
            icons({
                compiler: "solid",
                jsx: "react",
                // ensure we can always set the color
                iconCustomizer: (collection, icon, props) => {
                    console.log({ collection, icon, props });
                    // return svg.replace(/fill="[^"]*"/g, 'fill="currentColor"');
                },
            }),
        ],
    },
});
