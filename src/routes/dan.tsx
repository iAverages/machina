import { format, formatDistanceToNow } from "date-fns";
import { A, createAsync, RouteSectionProps } from "@solidjs/router";
import { For, Show, Suspense } from "solid-js";
import { env } from "~/env";

export default function Page(props: RouteSectionProps) {
  const listens = createAsync(
    async () => {
      const data = await fetch(
        env.PUBLIC_VIDEO_GENERATION_URL + "/get-dans-listening-history",
      );
      const json = (await data.json()) as {
        id: string;
        time: number;
        name: string;
        duration?: number;
        explicit?: number;
        artist_id?: string;
        album_id?: string;
        album_name?: string;
        cover_art?: string;
        artist_name?: string;
      }[];
      console.log({ json });
      return json;
    },
    { deferStream: false },
  );

  return (
    <Suspense fallback={<>loading</>}>
      <div class="min-h-screen bg-gray-900 text-gray-100">
        <div class="container max-w-[800px] mx-auto py-8 px-4">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-3xl font-bold">Dans Listening History</h1>
            </div>
          </header>

          <div class="grid gap-4">
            <For each={listens()}>
              {(listen) => (
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
                          <h2 class="font-semibold text-lg sm:text-xl truncate">
                            {listen.name}
                          </h2>
                        </A>

                        <Show when={listen.artist_name || listen.album_name}>
                          <p class="text-gray-400 truncate">
                            <Show when={listen.artist_name}>
                              {(name) => <span>{name()}</span>}
                            </Show>
                            <Show
                              when={listen.artist_name && listen.album_name}
                            >
                              <span> • </span>
                            </Show>
                            <Show when={listen.album_name}>
                              {(name) => <span>{name()}</span>}
                            </Show>
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
              )}
            </For>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
