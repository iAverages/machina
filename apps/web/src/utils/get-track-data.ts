import { query } from "@solidjs/router";
import { env } from "~/env-server";
import { env as envClient } from "~/env-client";
import { trackApiSchema } from "~/utils/spotify";
import { JSDOM } from "jsdom";

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

type MetaTags = {
    og: {
        site_name?: string;
        title?: string;
        image?: string;
        "image:type"?: string;
        description?: string;
        type?: string;
        [key: string]: string | undefined;
    };
    twitter: {
        card?: string;
        title?: string;
        description?: string;
        image?: string;
        [key: string]: string | undefined;
    };
    basic: {
        title?: string;
        [key: string]: string | undefined;
    };
};

const getPrereleaseData = async (id: string) => {
    const url = `https://open.spotify.com/prerelease/${id}`;
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const metaTags: MetaTags = {
        og: {},
        twitter: {},
        basic: {},
    };

    const metaElements = document.querySelectorAll("meta");

    metaElements.forEach((meta) => {
        const property = meta.getAttribute("property");
        const name = meta.getAttribute("name");
        const content = meta.getAttribute("content");
        if (!content) return;

        if (property?.startsWith("og:")) {
            const key = property.substring(3);
            metaTags.og[key] = content;
        } else if (name?.startsWith("twitter:")) {
            const key = name.substring(8);
            metaTags.twitter[key] = content;
        }
    });

    const titleElement = document.querySelector("title");
    if (titleElement?.textContent) {
        metaTags.basic.title = titleElement.textContent;
    }

    return metaTags;
};

const validTypes = ["track", "prerelease"] as const;
type ValidLinkType = (typeof validTypes)[number];

export const getTrackIdFromSlug = (slug: string) => {
    try {
        // Old nextjs web app would redirect from /https:// to /https:/
        const url = slug.startsWith("https:/open") ? new URL(slug.replace("https:/", "https://")) : new URL(slug);

        const secondSlash = url.pathname.indexOf("/", 2);
        const id = url.pathname.substring(secondSlash + 1);
        const type = url.pathname.substring(1, secondSlash) as ValidLinkType;

        if (!validTypes.includes(type)) return null;

        return { id, type };
    } catch {
        // simple base62 + 22 char limit check
        if (/^[a-zA-Z0-9]{22}$/.test(slug)) return { id: slug, type: "track" as const };
        return null;
    }
};

export const trackDataQuery = query(async (slug: string, preload = true) => {
    "use server";
    const trackInfo = getTrackIdFromSlug(slug);
    if (!trackInfo) {
        return null;
    }

    if (trackInfo.type === "track") {
        const track = await getTrackData(trackInfo.id);
        if (!track) {
            return null;
        }
        preload && (await fetch(`${envClient.PUBLIC_VIDEO_GENERATION_URL}/${track.id}`));
        return { type: "track" as const, data: track };
    }

    return { type: "prerelease" as const, meta: await getPrereleaseData(trackInfo.id) };
}, "track");
