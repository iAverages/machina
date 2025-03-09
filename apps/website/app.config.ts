import { defineConfig } from "@solidjs/start/config";

import "./src/env";

export default defineConfig({
    ssr: true,
    server: { preset: "node-server" },
    vite: {
        envPrefix: "PUBLIC_",
    },
});
