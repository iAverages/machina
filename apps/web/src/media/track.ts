import { env as envClient } from "~/env-client";
import { env } from "~/env-server";
import { vibrant } from "~/hooks/use-vibrant";
import { DEFAULT_GRADIENT, DEFAULT_THEME_COLOR } from "~/utils/consts";
import { trackApiSchema } from "~/utils/spotify";

const getSpotifyAuth = async () => {
    const client_id = env.SPOTIFY_CLIENT_ID;
    const client_secret = env.SPOTIFY_CLIENT_SECRET;

    const authOptions = {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "client_credentials",
        }),
    };

    const response = await fetch("https://accounts.spotify.com/api/token", authOptions);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.access_token as string | undefined;
};

const getData = async (id: string) => {
    const token = await getSpotifyAuth();
    const url = `https://api.spotify.com/v1/tracks/${id}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const validation = trackApiSchema.safeParse(await response.json());
    if (!validation.success) {
        console.log("failed validation", { errors: validation.error });
        return null;
    }
    const data = validation.data;
    const params = new URLSearchParams();
    const albumArt = data.album.images[0];
    let color = DEFAULT_THEME_COLOR;

    if (albumArt) {
        params.set("albumArt", albumArt.url);
        const colors = await vibrant({ data: { src: albumArt.url } });
        if (colors.baseColor !== DEFAULT_GRADIENT.to) color = colors.baseColor;
    }
    if (data.artists[0]) params.set("artist", data.artists[0].name);
    params.set("songName", data.name);
    const og = `${envClient.PUBLIC_APP_URL}/iapi/og?${params.toString()}`;

    return {
        type: "track" as const,
        id: id,
        color,
        data: {
            og,
            data,
        },
    };
};

export type TrackData = NonNullable<Awaited<ReturnType<typeof getData>>>;

const getHeadData = ({ data: track, color }: TrackData) => [
    { title: "machina" },
    { property: "og:title", content: track.data.name },
    { property: "og:description", content: track.data.artists[0]?.name },
    { property: "description", content: track.data.artists[0]?.name },
    {
        property: "og:url",
        content: `${envClient.PUBLIC_APP_URL}/https:/open.spotify.com/track/${track.data.id}`,
    },
    { property: "theme-color", content: color },
    { property: "og:image", content: `${track.og}&baddiscord=true` },
    { property: "og:type", content: "video" },
    {
        property: "og:video",
        content: `${envClient.PUBLIC_VIDEO_GENERATION_URL}/api/generate/video/${track.data.id}.mp4`,
    },
    { property: "og:video:type", content: "video/mp4" },
    { property: "og:video:height", content: "300" },
    { property: "og:video:width", content: "800" },
    {
        property: "og:video:secure_url",
        content: `${envClient.PUBLIC_VIDEO_GENERATION_URL}/api/generate/video/${track.data.id}.mp4`,
    },
];
export const trackProcessor = async (id: string) => {
    const data = await getData(id);
    if (!data) return null;
    const meta = getHeadData(data);
    return { meta, data };
};
