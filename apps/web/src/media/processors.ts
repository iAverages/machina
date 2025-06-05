import type { MediaType } from ".";
import { prereleaseProcessor } from "./prerelease";
import { trackProcessor } from "./track";

export const mediaTypeProcessor = {
    prerelease: prereleaseProcessor,
    track: trackProcessor,
} satisfies Record<MediaType, unknown>;
