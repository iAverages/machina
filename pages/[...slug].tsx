import { GetServerSidePropsContext } from "next";
import Head from "next/head";

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

const getTrackIdFromUrl = (url: string) => {
  const regex = /https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)(\?.*)?/;
  const match = url.match(regex);
  return match ? match[1] : null;
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
}

export interface Album {
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
      og,

      albumArt: data.album.images[0].url,
      artist: data.artists[0].name,
      songName: data.name,
    },
  };
}
export default function Page({
  og,
  artist,
  songName,
}: {
  og: string;

  albumArt: string;
  artist: string;
  songName: string;
}) {
  return (
    <div>
      <Head>
        <meta name="og:title" content={songName} />
        <meta name="og:description" content={artist} />
        <meta name="og:image" content={og} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={songName} />
        <meta name="twitter:description" content={artist} />
        <meta name="twitter:image" content={og} />
      </Head>
    </div>
  );
}
