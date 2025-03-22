import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "~/auth";
import { env } from "./env";
import { removeTrailingSlash } from "./utils";

const app = new Hono();

app.use(
    "/api/auth/*",
    cors({
        origin: removeTrailingSlash(env.APP_URL),
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

app.get("*", (c) => {
    return c.json({
        ready: true,
    });
});

export default {
    port: 3002,
    fetch: app.fetch,
};
