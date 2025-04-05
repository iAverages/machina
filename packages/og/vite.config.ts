import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        react(),
        dtsPlugin({
            compilerOptions: {
                tsBuildInfoFile: "tsconfig.tsbuildinfo",
                outDir: "dist",
                rootDir: "src",
                noEmit: false,
            },
            include: ["src/**/*.ts", "src/**/*.tsx"],
        }),
    ],
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
