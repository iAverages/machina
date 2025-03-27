import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { createMemo, createSignal, onMount } from "solid-js";
import { UserProfile } from "~/components/profile/user";
import { TopSongs } from "~/components/profile/top-tracks";
import { RecentTracks } from "~/components/profile/recent-tracks";
import { useParams, type RouteDefinition } from "@solidjs/router";
import { useProfile } from "~/queries/profile";
import { Show } from "solid-js";
import { FadeImage } from "~/components/fade-image";
import { useVibrant } from "~/hooks/use-vibrant";
import { interpolateCubehelix } from "d3-interpolate";
import { useWindowSize } from "@solid-primitives/resize-observer";

const GradientBackground = (props: { src: string }) => {
    const colors = useVibrant({ src: () => props.src });

    const gradientColors = createMemo(() => {
        const a = colors();
        if (!a || !a.gradientColor || !a.baseColor) return "";
        const b = interpolateCubehelix(a.baseColor, a.gradientColor);
        return [b(0), b(0.33), b(0.66), b(1)];
    });

    return (
        <div class="sticky h-0 top-0">
            <div
                style={{
                    "--color-a": gradientColors()[0],
                    "--color-b": gradientColors()[1],
                    "--color-c": gradientColors()[2],
                    "--color-d": gradientColors()[3],
                }}
                class="transition-gradient-background w-screen h-screen absolute top-0 pointer-events-none z-0"
            />
        </div>
    );
};

export const route = {
    matchFilters: {
        userId: (v) => typeof v === "string" && v.length > 0,
    },
} satisfies RouteDefinition<"/p/:userId">;

export default function SpotifyDashboard() {
    const params = useParams<{ userId: string }>();
    const profile = useProfile({ userId: params.userId });
    const clientSize = useWindowSize();

    const [timeRange, _setTimeRange] = createSignal("week");

    return (
        <div class="flex min-h-screen w-full flex-col">
            <Show when={profile.data?.currentPlaying.track?.albumArt}>
                {(albumArt) => <GradientBackground src={albumArt()} />}
            </Show>
            <div class="bg-background/90 z-10">
                <Show when={profile.data?.currentPlaying.track?.albumArt}>
                    {(albumArt) => (
                        <div class="sticky top-0 md right-0 pointer-events-none w-full h-fit">
                            <FadeImage
                                src={albumArt()}
                                opacity={0.25}
                                containerClass="absolute top-0 right-0"
                                imageWrapperClass="right-0"
                                class="object-contain opacity-25"
                                style={{
                                    height: clientSize.width > clientSize.height ? "100vh" : undefined,
                                    width: clientSize.width > clientSize.height ? undefined : "100vw",
                                    "mask-image":
                                        clientSize.width > clientSize.height
                                            ? "linear-gradient(to right, transparent 40%, black 100%)"
                                            : "linear-gradient(to top , transparent 10%, black 100%)",
                                    "mask-repeat": "no-repeat",
                                }}
                                aria-hidden
                            />
                        </div>
                    )}
                </Show>

                <div class="flex flex-col items-center">
                    <main class="flex flex-1 flex-col gap-6 p-6 md:gap-8 container">
                        <div>
                            <UserProfile userId={params.userId} />
                        </div>
                        <Card class="border-none bg-none bg-transparent shadow-none">
                            <CardHeader>
                                <div class="flex items-center justify-between">
                                    <CardTitle>Top Songs</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <TopSongs userId={params.userId} timeRange={timeRange()} />
                            </CardContent>
                        </Card>
                        <Card class="border-none bg-transparent shadow-none">
                            <CardHeader>
                                <div class="flex items-center justify-between">
                                    <CardTitle>Recent</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <RecentTracks />
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </div>
    );
}
