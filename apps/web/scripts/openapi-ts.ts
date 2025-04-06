import { createClient } from "@hey-api/openapi-ts";

createClient({
    input: {
        path: "http://localhost:3001/openapi.json",
    },
    output: {
        path: "src/api/client",
        format: "biome",
        lint: "biome",
    },
    plugins: ["@hey-api/client-fetch", "@tanstack/solid-query"],
});
