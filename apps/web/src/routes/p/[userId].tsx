import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { createSignal } from "solid-js";
import { UserProfile } from "~/components/profile/user";
import { TopSongs } from "~/components/profile/top-tracks";

export default function SpotifyDashboard() {
    const [timeRange, setTimeRange] = createSignal("week");

    return (
        <div class="flex min-h-screen w-full flex-col bg-background">
            <div class="flex flex-col items-center">
                <main class="flex flex-1 flex-col gap-6 p-6 md:gap-8 container">
                    <div class="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                        <UserProfile class="lg:col-span-2" />
                        {/* <ListeningHours class="lg:col-span-1" /> */}
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
                </main>
            </div>
        </div>
    );
}
