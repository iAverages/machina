import { Meta } from "@solidjs/meta";
import { createAsync, RouteSectionProps } from "@solidjs/router";
import { createSignal, For, Show, Suspense } from "solid-js";
import { env } from "~/env";
import { trackDataQuery } from "~/utils/get-track-data";

export default function Page(props: RouteSectionProps) {
  const listens = createAsync(
    async () => {
      const data = await fetch(
        env.PUBLIC_VIDEO_GENERATION_URL + "/get-dans-listening-history",
      );
      return (await data.json()) as {
        id: string;
        name: string;
        time: number;
      }[];
    },
    { deferStream: false },
  );

  return (
    <Suspense fallback={<>loading</>}>
      <div class="min-h-screen bg-gray-900 text-gray-100">
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-6 text-gray-100">Recent Listens</h1>
          <div class="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-700">
              <thead class="bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Track Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody class="bg-gray-800 divide-y divide-gray-700">
                <For each={listens()}>
                  {(listen) => (
                    <tr class="hover:bg-gray-700 transition-colors duration-200">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                        {listen.id}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {listen.name}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {listen.time}
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </div>{" "}
    </Suspense>
  );
}
