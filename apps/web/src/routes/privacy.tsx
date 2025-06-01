import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/privacy")({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>WIP</div>;
}
