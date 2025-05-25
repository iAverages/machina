import { ClientOnly } from "@ark-ui/solid";
import { useWindowSize } from "@solid-primitives/resize-observer";
import { type RouteDefinition, useParams } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { CurrentSongBg } from "~/components/current-song-page-bg";
import { FadeImage } from "~/components/fade-image";
import { GradientBackground } from "~/components/gradient-background";
import { RecentTracks } from "~/components/profile/recent-tracks";
import { TopSongs } from "~/components/profile/top-tracks";
import { UserProfile } from "~/components/profile/user";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useProfile } from "~/queries/profile";
import { cn } from "~/utils/cn";

export const route = {
    matchFilters: {
        userId: (v) => typeof v === "string" && v.length > 0,
    },
} satisfies RouteDefinition<"/p/:userId">;

export default function SpotifyDashboard() {
    return (
        <ClientOnly>
            <Dashboard />
        </ClientOnly>
    );
}

const Dashboard = () => {
    const params = useParams<{ userId: string }>();
    const profile = useProfile({ userId: params.userId });
    const [timeRange, _setTimeRange] = createSignal("week");

    return (
        <CurrentSongBg albumArt={profile.data?.currentPlaying.track?.albumArt}>
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
        </CurrentSongBg>
    );
};
