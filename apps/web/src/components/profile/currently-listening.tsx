import { createEffect, createMemo, createSignal, on, Show } from "solid-js";
import { Progress } from "../ui/progress";
import { ExternalLink } from "~/icons/external";
import { useProfile } from "~/queries/profile";
import type { Profile } from "~/api/client";
import { FadeImage } from "../fade-image";

export function CurrentlyListening(props: { userId: string }) {
    const profile = useProfile({ userId: props.userId });

    const playing = createMemo(() => {
        if (!profile.data)
            return { isPlaying: false, progress: 0, track: undefined } satisfies NonNullable<Profile["currentPlaying"]>;
        if (!profile.data.currentPlaying.track)
            return { isPlaying: false, progress: 0, track: undefined } satisfies NonNullable<Profile["currentPlaying"]>;
        return {
            ...profile.data.currentPlaying,
            track: profile.data.currentPlaying.track,
        };
    });

    const [progress, setProgress] = createSignal(playing().progress ?? 0);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    let timer: NodeJS.Timeout | null = null;
    createEffect(
        on(playing, (playing) => {
            if (!playing.isPlaying) {
                timer && clearInterval(timer);
                timer = null;
                setProgress(0);
                return;
            }

            // timer already started
            if (timer) return;
            timer = setInterval(() => {
                if (progress() >= playing.track.duration) {
                    profile.refetch();
                    setProgress(0);
                    return;
                }
                setProgress((prev) => prev + 1);
            }, 1000);
        }),
    );

    const progressPercent = createMemo(() => (progress() / (playing().track?.duration ?? 0)) * 100);

    if (!playing().isPlaying) return null;

    return (
        <Show when={playing().track}>
            {(track) => (
                <div class="rounded-xl p-4 md:p-5 w-md">
                    <div class="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <div class="relative">
                            <div class="relative h-24 w-24 md:h-28 md:w-28 rounded-md overflow-hidden">
                                <FadeImage
                                    src={track().albumArt ?? ""}
                                    alt={`${track().trackName} album art`}
                                    class="object-cover"
                                />
                            </div>
                        </div>

                        <div class="flex-1 text-center md:text-left">
                            <div class="flex items-center justify-between gap-2">
                                <h2 class="text-xl md:text-2xl font-bold">{track().trackName}</h2>
                                <a
                                    href={`https://open.spotify.com/track/${track().trackId.split(":")[2]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-green-500 hover:text-green-400"
                                >
                                    <ExternalLink class="h-4 w-4" />
                                    <span class="sr-only">Open on Spotify</span>
                                </a>
                            </div>
                            <p class="text-zinc-300">{track().artistName}</p>
                            <p class="text-sm text-zinc-400">{track().albumName}</p>

                            <div class="mt-3 md:mt-4 space-y-2 max-w-xl">
                                <Progress value={progressPercent()} class="h-1.5" />
                                <div class="flex justify-between text-xs text-zinc-400">
                                    <span>{formatTime(progress())}</span>
                                    <span>{formatTime(track().duration)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Show>
    );
}
