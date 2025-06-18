import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/dan")({
    loader: () => {
        throw redirect({
            to: "/p/$userId",
            params: {
                userId: "fp0sllluqyvm69f5ukrc6buv",
            },
        });
    },
});
