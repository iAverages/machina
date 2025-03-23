import { createEffect, createMemo, createSignal, on, onCleanup, onMount } from "solid-js";
import { Progress } from "../ui/progress";
import { ExternalLink } from "~/icons/external";
import { useProfile } from "~/queries/profile";
import { useParams } from "@solidjs/router";

export function CurrentlyListening() {
    // biome-ignore lint/style/noNonNullAssertion:
    const profile = useProfile({ userId: useParams().userId! });
    const now = profile.data?.currentPlaying.track;

    const currentTrack = {
        isPlaying: true,
        title: now?.trackName,
        artist: now?.artistName,
        album: now?.albumName,
        imageUrl: now?.albumArt,
        duration: now?.duration,
        spotifyUrl: "#",
    };

    createEffect(() => {
        console.log({ profile: profile.data });
    });
    const [progress, setProgress] = createSignal(
        ((profile.data?.currentPlaying.progress ?? 0) / (now?.duration ?? 1)) * 100,
    );
    const [isPlaying, setIsPlaying] = createSignal(currentTrack.isPlaying);

    let interval: NodeJS.Timeout | null;

    onMount(() => {
        interval = setInterval(async () => {
            if (progress() > 102) {
                const data = await profile.refetch();
                setProgress(
                    ((data.data?.currentPlaying?.progress ?? 0) / (data.data?.currentPlaying.track?.duration ?? 1)) *
                        100,
                );

                return;
            }
            setProgress((prev) => {
                return prev + 1;
            });
        }, 1000);
    });

    onCleanup(() => {
        interval && clearInterval(interval);
    });

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const currentTime = createMemo(() => Math.floor((progress() / 100) * (currentTrack.duration ?? 0)));

    if (!currentTrack.isPlaying) return null;

    return (
        <div class="rounded-xl p-4 md:p-5 w-md">
            <div class="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div class="relative">
                    <div class="relative h-24 w-24 md:h-28 md:w-28 rounded-md overflow-hidden">
                        <img
                            src={currentTrack.imageUrl ?? ""}
                            alt={`${currentTrack.title} album art`}
                            class="object-cover"
                        />
                    </div>
                </div>

                <div class="flex-1 text-center md:text-left">
                    <div class="flex items-center justify-between gap-2">
                        <h2 class="text-xl md:text-2xl font-bold">{currentTrack.title}</h2>
                        <a
                            href={currentTrack.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-green-500 hover:text-green-400"
                        >
                            <ExternalLink class="h-4 w-4" />
                            <span class="sr-only">Open on Spotify</span>
                        </a>
                    </div>
                    <p class="text-zinc-300">{currentTrack.artist}</p>
                    <p class="text-sm text-zinc-400">{currentTrack.album}</p>

                    <div class="mt-3 md:mt-4 space-y-2 max-w-xl">
                        <Progress value={progress()} class="h-1.5" />
                        <div class="flex justify-between text-xs text-zinc-400">
                            <span>{formatTime(currentTime())}</span>
                            <span>{formatTime(currentTrack.duration ?? 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
