import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/terms")({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>WIP</div>;
}
