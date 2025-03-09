import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

import "./src/env";

export default defineConfig({
    ssr: true,
    server: { preset: "node-server" },
    vite: {
        envPrefix: "PUBLIC_",
        plugins: [tailwindcss()],
    },
});
