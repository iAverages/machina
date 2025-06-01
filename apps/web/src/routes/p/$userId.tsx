import { ClientOnly } from "@ark-ui/solid";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { CurrentSongBg } from "~/components/current-song-page-bg";
import { RecentTracks } from "~/components/profile/recent-tracks";
import { TopSongs } from "~/components/profile/top-tracks";
import { UserProfile } from "~/components/profile/user";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useProfile } from "~/queries/profile";

export const Route = createFileRoute("/p/$userId")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <ClientOnly>
            <Dashboard />
        </ClientOnly>
    );
}

const Dashboard = () => {
    const params = Route.useParams();
    const profile = useProfile({ userId: params().userId });
    const [timeRange, _setTimeRange] = createSignal("week");

    return (
        <CurrentSongBg albumArt={profile.data?.currentPlaying.track?.albumArt}>
            <div>
                <UserProfile userId={params().userId} />
            </div>
            <Card class="border-none bg-none bg-transparent shadow-none">
                <CardHeader>
                    <div class="flex items-center justify-between">
                        <CardTitle>Top Songs</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <TopSongs userId={params().userId} timeRange={timeRange()} />
                </CardContent>
            </Card>
            <Card class="border-none bg-transparent shadow-none">
                <CardHeader>
                    <div class="flex items-center justify-between">
                        <CardTitle>Recent</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <RecentTracks userId={params().userId} />
                </CardContent>
            </Card>
        </CurrentSongBg>
    );
};
