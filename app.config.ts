import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: true,
  server: { preset: "node-server" },
  vite: {
    envPrefix: "PUBLIC_",
  },
});
