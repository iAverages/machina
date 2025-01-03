import { z } from "zod";

export const externalUrlsSchema = z.object({
  spotify: z.string(),
});

export const imageSchema = z.object({
  url: z.string(),
  height: z.number(),
  width: z.number(),
});

export const artistSchema = z.object({
  external_urls: externalUrlsSchema,
  href: z.string(),
  id: z.string(),
  name: z.string(),
  type: z.string(),
  uri: z.string(),
});

export const albumSchema = z.object({
  name: z.string(),
  external_urls: externalUrlsSchema,
  href: z.string(),
  id: z.string(),
  images: z.array(imageSchema),
});

export const trackApiSchema = z.object({
  album: albumSchema,
  artists: z.array(artistSchema),
  id: z.string(),
  name: z.string(),
  popularity: z.number(),
  preview_url: z.string().nullish(),
  type: z.string(),
  uri: z.string(),
  duration_ms: z.number(),
});

export type ExternalUrls = z.infer<typeof externalUrlsSchema>;
export type Image = z.infer<typeof imageSchema>;
export type Artist = z.infer<typeof artistSchema>;
export type Album = z.infer<typeof albumSchema>;
export type TrackApi = z.infer<typeof trackApiSchema>;
