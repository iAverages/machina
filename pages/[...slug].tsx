import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";
import { getTrackData } from "../og/get-track-data";

export const config = {
  runtime: "experimental-edge",
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const trackId = context.params.slug[3];
  const data = await getTrackData(trackId);

  // "preload" the preview video
  fetch(`https://s-video.kirsi.dev/${data.trackId}`).then((res) =>
    console.log("preload request", res),
  );

  return { props: data };
}

export default function Page({
  og,
  track,
}: Awaited<ReturnType<typeof getServerSideProps>>["props"]) {
  return (
    <>
      <Head>
        <meta property="og:title" content={track.name} />
        <meta property="og:description" content={track.artists[0].name} />
        <meta property="description" content={track.artists[0].name} />
        <meta
          property="og:url"
          content={`https://s.kirsi.dev/https:/open.spotify.com/track/${track.id}`}
        />
        <meta property="theme-color" content="#7e22ce" />
        <meta property="og:image" content={og} />
        <meta property="og:type" content="video" />
        <meta
          property="og:video"
          content={`https://s-video.kirsi.dev/${track.id}.mp4`}
        />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:height" content="300" />
        <meta property="og:video:width" content="800" />
        <meta
          property="og:video:secure_url"
          content={`https://s-video.kirsi.dev/${track.id}.mp4`}
        />
      </Head>

      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-3xl mx-auto">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-100 mb-2">
                {track.name}
              </h1>
              <p className="text-gray-400 mb-4">
                {track.artists.map((artist) => artist.name).join(", ")}
              </p>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                <Image
                  src={track.album.images[0].url}
                  alt={`${track.album.name} cover`}
                  width={150}
                  height={150}
                  className="rounded-md"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">Album</h3>
                  <p className="text-gray-400">{track.album.name}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">
                  Listen on Spotify
                </h3>
                <iframe
                  src={`https://open.spotify.com/embed/track/${track.id}`}
                  width="100%"
                  height="80"
                  allow="encrypted-media"
                  className="rounded-md"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
