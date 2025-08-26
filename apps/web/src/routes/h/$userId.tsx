import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/h/$userId")({
    loader: ({ params }) => {
        throw redirect({
            to: "/p/$userId",
            params: params,
        });
    },
});
