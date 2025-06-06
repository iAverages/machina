import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";
import { CurrentSongBg } from "~/components/current-song-page-bg";
import { OverviewStats } from "~/components/pages/dashboard/overview-stats";
import { TopArtist } from "~/components/profile/artist";
import { TopTrack } from "~/components/profile/track";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ExternalLink } from "~/icons/external";
import { getSelfProfileQueryOptions, useSelfProfile } from "~/queries/profile";

export const Route = createFileRoute("/dashboard/")({
    component: RouteComponent,
    // TODO: work out why ssr loads fine, then shows pendingComponent
    // on client for a second
    ssr: false,
    loader: async ({ context: { queryClient } }) => {
        await queryClient.fetchQuery(getSelfProfileQueryOptions);
    },
});

function RouteComponent() {
    const [_activeTab, setActiveTab] = createSignal("");

    const profile = useSelfProfile();
    const topTracks = () => profile.data?.topTracks.slice(0, 5) ?? [];
    const topArtists = () => profile.data?.topArtists.slice(0, 5) ?? [];

    return (
        <CurrentSongBg albumArt={profile.data?.currentPlaying.track?.albumArt}>
            <Show when={profile.data}>
                {(profile) => (
                    <div class="container mx-auto px-4 py-6 max-w-6xl">
                        <div class="flex flex-col md:flex-row gap-6 mt-6">
                            <div class="flex-1">
                                <Tabs defaultValue="overview" class="w-full" onChange={setActiveTab}>
                                    <TabsList class="bg-zinc-800/50 text-zinc-400 p-1 mb-6">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="music">Music</TabsTrigger>
                                        <TabsTrigger value="history">History</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" class="space-y-6">
                                        <OverviewStats
                                            totalListeningHours={profile().overview.totalListeningHours}
                                            totalPlays={profile().overview.totalPlays}
                                            uniqueTracks={profile().overview.uniqueTracks}
                                            weeklyAverage={profile().overview.weeklyAverage}
                                        />

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div class="bg-zinc-900/70 rounded-xl border border-zinc-800 p-5">
                                                <div class="flex items-center justify-between mb-4">
                                                    <h2 class="text-xl font-bold">Top Tracks</h2>
                                                    <Button variant="link" size="sm" class="text-green-500 gap-1">
                                                        View All
                                                        <ExternalLink class="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div class="flex flex-col gap-2">
                                                    <For each={topTracks()}>{(song) => <TopTrack {...song} />}</For>
                                                </div>
                                            </div>

                                            <div class="bg-zinc-900/70 rounded-xl border border-zinc-800 p-5">
                                                <div class="flex items-center justify-between mb-4">
                                                    <h2 class="text-xl font-bold">Top Artists</h2>
                                                    <Button variant="link" size="sm" class="text-green-500 gap-1">
                                                        View All
                                                        <ExternalLink class="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div class="flex flex-col gap-2">
                                                    <For each={topArtists()}>
                                                        {(artist) => <TopArtist {...artist} />}
                                                    </For>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div class="md:col-span-2 bg-zinc-900/70 rounded-xl border border-zinc-800 p-5">
                                                <div class="flex items-center justify-between mb-4">
                                                    <h2 class="text-xl font-bold">Recent</h2>
                                                </div>
                                                {/* <PublicRecentActivity /> */}
                                            </div>

                                            <div class="bg-zinc-900/70 rounded-xl border border-zinc-800 p-5">
                                                <div class="flex items-center justify-between mb-4">
                                                    <h2 class="text-xl font-bold">Genres</h2>
                                                </div>
                                                {/* <PublicGenreChart /> */}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="music" class="space-y-6">
                                        <div class="bg-zinc-900/70 rounded-xl border border-zinc-800 p-5">
                                            <h2 class="text-xl font-bold mb-4">All Time Favorites</h2>
                                            {/* <PublicTopTracks limit={10} /> */}
                                        </div>

                                        <div class="bg-zinc-900/70 rounded-xl border border-zinc-800 p-5">
                                            <h2 class="text-xl font-bold mb-4">Favorite Artists</h2>
                                            {/* <PublicTopArtists limit={10} /> */}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="history" class="space-y-6">
                                        <div class="bg-zinc-900/70 rounded-xl border border-zinc-800 p-5">
                                            <h2 class="text-xl font-bold mb-4">Listening History</h2>
                                            {/* <PublicListeningHistory /> */}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                )}
            </Show>
        </CurrentSongBg>
    );
}
