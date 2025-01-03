import { Meta } from "@solidjs/meta";
import {
  createAsync,
  RouteDefinition,
  RouteSectionProps,
} from "@solidjs/router";
import { Show } from "solid-js";
import { env } from "~/env";
import { trackDataQuery } from "~/utils/get-track-data";

export const route = {
  preload: async (props) => {
    // i hate browsers
    if (props.params.slug === "favicon.ico") return;
    await trackDataQuery(props.params.slug);
  },
} satisfies RouteDefinition;

export default function Page(props: RouteSectionProps) {
  const data = createAsync(() => trackDataQuery(props.params.slug), {
    deferStream: true,
  });

  return (
    <Show when={data()?.data} fallback={<>couldnt find that song</>}>
      {(track) => (
        <>
          <Meta property="og:title" content={track().name} />
          <Meta property="og:description" content={track().artists[0].name} />
          <Meta property="description" content={track().artists[0].name} />
          <Meta
            property="og:url"
            content={`${env.PUBLIC_VIDEO_GENERATION_URL}/https:/open.spotify.com/track/${track().id}`}
          />
          <Meta property="theme-color" content="#7e22ce" />
          <Meta property="og:image" content={data()?.og + "&baddiscord=true"} />
          <Meta property="og:type" content="video" />
          <Meta
            property="og:video"
            content={`${env.PUBLIC_VIDEO_GENERATION_URL}/${track().id}.mp4`}
          />
          <Meta property="og:video:type" content="video/mp4" />
          <Meta property="og:video:height" content="300" />
          <Meta property="og:video:width" content="800" />
          <Meta
            property="og:video:secure_url"
            content={`${env.PUBLIC_VIDEO_GENERATION_URL}/${track().id}.mp4`}
          />
          <div class="min-h-screen bg-gray-900 text-gray-100">
            <div class="container mx-auto py-8 px-4">
              <div class="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-3xl mx-auto">
                <div class="p-6">
                  <h1 class="text-3xl font-bold text-gray-100 mb-2">
                    {track.name}
                  </h1>
                  <p class="text-gray-400 mb-4">
                    {track()
                      .artists.map((artist) => artist.name)
                      .join(", ")}
                  </p>
                  <div class="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                    <img
                      src={track().album.images[0].url}
                      alt={`${track().album.name} cover`}
                      width={150}
                      height={150}
                      class="rounded-md"
                    />
                    <div>
                      <h3 class="text-lg font-semibold text-gray-200">Album</h3>
                      <p class="text-gray-400">{track().album.name}</p>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-200 mb-2">
                      Listen on Spotify
                    </h3>
                    <iframe
                      src={`https://open.spotify.com/embed/track/${track().id}`}
                      width="100%"
                      height="80"
                      allow="encrypted-media"
                      class="rounded-md"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Show>
  );
}
