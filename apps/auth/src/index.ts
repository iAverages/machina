import { Hono } from "hono";
import { auth } from "@machina/auth-client";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
    "/api/auth/*",
    cors({
        origin: "http://localhost:3000", // replace with your origin
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
});

export default {
    port: 3002,
    fetch: app.fetch,
};
