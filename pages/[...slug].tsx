import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";

const getSpotifyAuth = async () => {
  const client_id = process.env.client_id;
  const client_secret = process.env.client_secret;

  const authOptions = {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  };

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    authOptions,
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();

  const token = data.access_token;
  return token;
};

export interface TrackApi {
  album: Album;
  artists: Artist[];
  id: string;
  name: string;
  popularity: number;
  preview_url: string;
  type: string;
  uri: string;
  duration_ms: number;
}

export interface Album {
  name: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
}

export interface ExternalUrls {
  spotify: string;
}

export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface Artist {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const token = await getSpotifyAuth();
  const trackId = context.params.slug[3];
  const url = `https://api.spotify.com/v1/tracks/${trackId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = (await response.json()) as TrackApi;
  console.log({ url, data });
  const base = "https://s.kirsi.dev";
  const params = new URLSearchParams();
  params.set("albumArt", data.album.images[0].url);
  params.set("artist", data.artists[0].name);
  params.set("songName", data.name);
  const og = `${base}/api/og?${params.toString()}`;

  return {
    props: {
      trackId,
      og,
      track: data,

      albumArt: data.album.images[0].url,
      artist: data.artists[0].name,
      songName: data.name,
    },
  };
}
export default function Page({
  og,
  track,
  artist,
  songName,
  trackId,
}: Awaited<ReturnType<typeof getServerSideProps>>["props"]) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <>
      <Head>
        <meta name="og:title" content={songName} />
        <meta name="og:description" content={artist} />
        <meta name="og:image" content={og} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={songName} />
        <meta name="twitter:description" content={artist} />
        <meta name="twitter:image" content={og} />
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
