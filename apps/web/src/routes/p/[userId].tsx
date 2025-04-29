import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { createSignal } from "solid-js";
import { UserProfile } from "~/components/profile/user";
import { TopSongs } from "~/components/profile/top-tracks";
import { RecentTracks } from "~/components/profile/recent-tracks";
import { useParams, type RouteDefinition } from "@solidjs/router";
import { useProfile } from "~/queries/profile";
import { Show } from "solid-js";
import { FadeImage } from "~/components/fade-image";
import { useWindowSize } from "@solid-primitives/resize-observer";
import { cn } from "~/utils/cn";
import { GradientBackground } from "~/components/gradient-background";

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
            <Show when={profile.data?.currentPlaying?.track?.albumArt}>
                {(albumArt) => <GradientBackground src={albumArt()} />}
            </Show>
            <div class="bg-background/40 z-10">
                <Show when={profile.data?.currentPlaying?.track?.albumArt}>
                    {(albumArt) => (
                        <div class="sticky top-0 md right-0 pointer-events-none w-full h-fit">
                            <FadeImage
                                fadeOnMount
                                src={albumArt()}
                                opacity="opacity-25"
                                containerClass="absolute top-0 right-0"
                                imageWrapperClass="right-0"
                                class={cn("object-contain", {
                                    "mask-gradient-horizontal h-screen": clientSize.width > clientSize.height,
                                    "mask-gradient-vertical w-screen": clientSize.width <= clientSize.height,
                                })}
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
