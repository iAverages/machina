import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    build: {
        target: "esnext",
        minify: false,
        lib: {
            entry: resolve(__dirname, "./src/open-graph.tsx"),
            fileName: "index",
            formats: ["es"],
        },
        rollupOptions: {
            external: ["react/jsx-runtime"],
        },
    },
});
