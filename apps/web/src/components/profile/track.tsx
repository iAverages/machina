import { formatDistanceToNow } from "date-fns";
import { Show } from "solid-js";
import type { CursorPaginatedStringVecListenDataInner, Profile } from "~/api/client";

export const TopTrack = (song: Profile["topTracks"][number]) => (
    <div class="flex items-center gap-2 rounded-lg border p-3">
        <div class="relative h-16 w-16 flex-shrink-0">
            <Show when={song.albumArt}>
                {/* biome-ignore lint/style/noNonNullAssertion: we checked */}
                <img src={song.albumArt!} alt={`${song.trackName} album cover`} class="rounded-md object-cover" />
            </Show>
        </div>
        <div class="flex-1 space-y-1 overflow-hidden">
            <h3 class="font-medium leading-none truncate">{song.trackName}</h3>
            <p class="text-sm text-muted-foreground truncate">{song.artistName}</p>
            <p class="text-xs text-muted-foreground truncate">{song.albumName}</p>
        </div>
        <div class="text-right max-w-24">
            <div class="text-sm font-medium">{song.listenCount} plays</div>
            <div class="text-xs text-muted-foreground">
                {Math.round(((song.duration ?? 0) * song.listenCount) / 60)} mintues listened
            </div>
        </div>
    </div>
);

// TODO: change type name lol
export const Track = (song: CursorPaginatedStringVecListenDataInner) => (
    <div class="flex items-center gap-2 rounded-lg border p-3">
        <div class="relative h-16 w-16 flex-shrink-0">
            <Show when={song.coverArt}>
                {/* biome-ignore lint/style/noNonNullAssertion: we checked  */}
                <img src={song.coverArt!} alt={`${song.name} album cover`} class="rounded-md object-cover" />
            </Show>
        </div>
        <div class="flex-1 space-y-1 overflow-hidden">
            <h3 class="font-medium leading-none truncate">{song.name}</h3>
            <p class="text-sm text-muted-foreground truncate">{song.artistName}</p>
            <p class="text-xs text-muted-foreground truncate">{song.albumName}</p>
        </div>
        <div class="flex items-center gap-1 text-gray-400 whitespace-nowrap">
            <span class="text-sm">
                {formatDistanceToNow(song.time / 1000, {
                    addSuffix: true,
                })}
            </span>
        </div>
    </div>
);
