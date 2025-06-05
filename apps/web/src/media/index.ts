import type { JSX } from "solid-js";
import { capitalize } from "~/utils/string";

export const mediaTypes = ["track", "prerelease"] as const;
export type MediaType = (typeof mediaTypes)[number];

export const MediaType = Object.fromEntries(mediaTypes.map((type) => [capitalize(type), type])) as {
    [K in (typeof mediaTypes)[number] as Capitalize<K>]: K;
};

export type MaybePromise<T> = Promise<T> | T;

export type MediaTypeHelpers<MediaData> = {
    getMediaData: (id: string) => MaybePromise<MediaData>;
    getHeadMeta: (
        media: NonNullable<Awaited<MediaData>>,
    ) => MaybePromise<Array<JSX.IntrinsicElements["meta"] | undefined>>;
};
