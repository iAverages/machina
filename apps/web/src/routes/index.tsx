import { createFileRoute } from "@tanstack/solid-router";
import anna from "../anna-yanami-makeine.gif?url";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div class="min-h-screen w-full items-center justify-center flex flex-col gap-2 bg-gray-900 text-gray-100">
            <h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Coming Soon</h1>
            <div class="rounded-lg overflow-hidden">
                <img src={anna} alt="anna wave" />
            </div>
        </div>
    );
}
