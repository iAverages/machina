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
export const getTrackData = async (trackId: string) => {
  const token = await getSpotifyAuth();
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
    trackId,
    og,
    track: data,
  };
};
