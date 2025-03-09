import { A } from "@solidjs/router";
import { formatDistanceToNow } from "date-fns";
import { Show } from "solid-js";

export const ListenItem = (props: { listen: any }) => {
    const listen = props.listen;

    return (
        <div class="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
            <div class="p-4">
                <div class="flex items-center gap-4">
                    <Show when={listen.cover_art}>
                        {(url) => (
                            <div class="relative min-w-[64px] h-16 sm:min-w-[80px] sm:h-20">
                                <img
                                    src={url()}
                                    alt={`${listen.album_name} album art`}
                                    class="object-cover rounded-md w-[64px] sm:w-[80px]"
                                />
                            </div>
                        )}
                    </Show>

                    <div class="flex-1 min-w-0">
                        <A
                            href={`https://open.spotify.com/track/${listen.id.split(":")[2]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="group flex items-center gap-1 hover:text-spotify-green transition-colors"
                        >
                            <h2 class="font-semibold text-lg sm:text-xl truncate">{listen.name}</h2>
                        </A>

                        <Show when={listen.artist_name || listen.album_name}>
                            <p class="text-gray-400 truncate">
                                <Show when={listen.artist_name}>{(name) => <span>{name()}</span>}</Show>
                                <Show when={listen.artist_name && listen.album_name}>
                                    <span> • </span>
                                </Show>
                                <Show when={listen.album_name}>{(name) => <span>{name()}</span>}</Show>
                            </p>
                        </Show>
                    </div>

                    <div class="flex items-center gap-1 text-gray-400 whitespace-nowrap">
                        <span class="text-sm">
                            {formatDistanceToNow(listen.time / 1000, {
                                addSuffix: true,
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
