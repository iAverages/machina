import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { createSignal } from "solid-js";
import { UserProfile } from "~/components/profile/user";
import { TopSongs } from "~/components/profile/top-tracks";
import { RecentTracks } from "~/components/profile/recent-tracks";
import { useParams, type RouteDefinition } from "@solidjs/router";

export const route = {
    matchFilters: {
        userId: (v) => typeof v === "string" && v.length > 0,
    },
} satisfies RouteDefinition;

export default function SpotifyDashboard() {
    const params = useParams<{ userId: string }>();
    const [timeRange, _setTimeRange] = createSignal("week");

    return (
        <div class="flex min-h-screen w-full flex-col bg-background">
            <div class="flex flex-col items-center">
                <main class="flex flex-1 flex-col gap-6 p-6 md:gap-8 container">
                    <div>
                        <UserProfile userId={params.userId} />
                    </div>

                    <div class="grid gap-6 md:grid-cols-1">
                        <Card class="border-none">
                            <CardHeader>
                                <div class="flex items-center justify-between">
                                    <CardTitle>Top Songs</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <TopSongs timeRange={timeRange()} />
                            </CardContent>
                        </Card>
                    </div>

                    <div class="grid gap-6 md:grid-cols-1">
                        <Card class="border-none">
                            <CardHeader>
                                <div class="flex items-center justify-between">
                                    <CardTitle>Recent</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <RecentTracks />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
