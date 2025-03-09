import { createAsync, useParams } from "@solidjs/router";
import { For, Suspense } from "solid-js";
import { env } from "~/env";
import { ListenItem } from "~/components/listen-item";

export default function Page() {
  const params = useParams();
  const listens = createAsync(
    async () => {
      const data = await fetch(
        env.PUBLIC_VIDEO_GENERATION_URL + `/history/${params.userId}`,
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
              <h1 class="text-3xl font-bold">Someones Listening History</h1>
            </div>
          </header>

          <div class="grid gap-4">
            <For each={listens()}>
              {(listen) => <ListenItem listen={listen} />}
            </For>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
