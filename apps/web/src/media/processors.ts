import type { MediaType } from ".";
import { albumProcessor } from "./album";
import { prereleaseProcessor } from "./prerelease";
import { trackProcessor } from "./track";

export const mediaTypeProcessor = {
    prerelease: prereleaseProcessor,
    track: trackProcessor,
    album: albumProcessor,
} satisfies Record<MediaType, unknown>;
