import { Show } from "solid-js";
import type { SelfProfile } from "~/api/client";
import { ExternalLink } from "~/icons/external";

export const TopArtist = (song: SelfProfile["topArtists"][number]) => (
    <a href={`https://open.spotify.com/artist/${song.artistId.split(":")[2]}`} target="_blank" rel="noreferrer">
        <div class="flex items-center gap-2 rounded-lg border p-3 group cursor-pointer bg-black/20 backdrop-blur-sm">
            <div class="relative h-16 w-16 flex-shrink-0">
                {/* <Show when={song.albumArt}> */}
                {/* biome-ignore lint/style/noNonNullAssertion: we checked */}
                {/*     <img src={song.albumArt!} alt={`${song.trackName} album cover`} class="rounded-md object-cover" /> */}
                {/* </Show> */}
            </div>
            <div class="flex-1 space-y-1 overflow-hidden">
                <div class="group-hover:text-green-400 flex gap-1 items-center">
                    <h3 class="font-medium leading-none truncate">{song.artistName}</h3>

                    <span class="group-hover:opacity-100 opacity-0">
                        <ExternalLink class="size-4" />
                    </span>
                </div>
                <p class="text-sm text-muted-foreground truncate">{song.artistName}</p>
            </div>
            <div class="text-right max-w-24">
                <div class="text-sm font-medium">{song.listenCount} plays</div>
                <div class="text-xs text-muted-foreground">
                    {/* {Math.round(((song.duration ?? 0) * song.listenCount) / 60)} mintues listened */}
                </div>
            </div>
        </div>
    </a>
);
