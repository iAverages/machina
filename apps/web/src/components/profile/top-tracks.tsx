import { cn } from "~/utils/cn";
import { Button } from "../ui/button";
import { useProfile } from "~/queries/profile";
import { useParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

interface TopSongsProps {
    timeRange: string;
    className?: string;
}

export function TopSongs({ timeRange, className }: TopSongsProps) {
    const [showMore, setShowMore] = createSignal(false);
    const params = useParams();
    const profile = useProfile({ userId: params.userId! });

    const firstTop = createMemo(() => {
        return profile.data?.top_tracks.slice(0, 6) ?? [];
    });

    const secondTop = createMemo(() => {
        return profile.data?.top_tracks.slice(6) ?? [];
    });

    const buttonLabel = createMemo(() => (showMore() ? "Show Less" : "Show More"));

    return (
        <Collapsible open={showMore()} onOpenChange={setShowMore} class="flex gap-2 flex-col">
            <div class={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2", className)}>
                <For each={firstTop()}>{(song) => <TopTrack {...song} />}</For>
                <Show when={showMore()}>
                    <For each={secondTop()}>{(song) => <TopTrack {...song} />}</For>
                </Show>
            </div>
            <CollapsibleTrigger class={"self-end w-fit cursor-pointer"} as={Button}>
                {buttonLabel()}
            </CollapsibleTrigger>
        </Collapsible>
    );
}

const TopTrack = (song: NonNullable<ReturnType<typeof useProfile>["data"]>["top_tracks"][number]) => (
    <div class="flex items-center gap-2 rounded-lg border p-3">
        <div class="relative h-16 w-16 flex-shrink-0">
            <img src={song.album_art} alt={`${song.track_name} album cover`} class="rounded-md object-cover" />
        </div>
        <div class="flex-1 space-y-1 overflow-hidden">
            <h3 class="font-medium leading-none truncate">{song.track_name}</h3>
            <p class="text-sm text-muted-foreground truncate">{song.artist_name}</p>
            <p class="text-xs text-muted-foreground truncate">{song.album_name}</p>
        </div>
        <div class="text-right max-w-24">
            <div class="text-sm font-medium">{song.listen_count} plays</div>
            <div class="text-xs text-muted-foreground">
                {Math.round((song.duration * song.listen_count) / 60)} mintues listened
            </div>
        </div>
    </div>
);
