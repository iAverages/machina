import { query } from "@solidjs/router";
import { env } from "~/env-server";
import { env as envClient } from "~/env-client";
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

export const getTrackData = async (trackId: string) => {
    const token = await getSpotifyAuth();
    const url = `https://api.spotify.com/v1/tracks/${trackId}`;

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
    if (data.album.images[0]) params.set("albumArt", data.album.images[0].url);
    if (data.artists[0]) params.set("artist", data.artists[0].name);
    params.set("songName", data.name);
    const og = `${envClient.PUBLIC_APP_URL}/api/og?${params.toString()}`;

    return {
        id: trackId,
        og,
        data,
    };
};

export const getTrackIdFromSlug = (slug: string) => {
    try {
        // Old nextjs web app would redirect from /https:// to /https:/
        const url = slug.startsWith("https:/open") ? new URL(slug.replace("https:/", "https://")) : new URL(slug);

        return url.pathname.replace("/track/", "");
    } catch {
        // simple base62 + 22 char limit check
        if (/^[a-zA-Z0-9]{22}$/.test(slug)) return slug;
        return null;
    }
};

export const trackDataQuery = query(async (slug: string, preload = true) => {
    "use server";
    const trackId = getTrackIdFromSlug(slug);
    if (!trackId) {
        return null;
    }
    const track = await getTrackData(trackId);
    if (!track) {
        return null;
    }
    preload && (await fetch(`${envClient.PUBLIC_VIDEO_GENERATION_URL}/${track.id}`));
    return track;
}, "track");
