import { createQuery } from "@tanstack/solid-query";
import { env } from "~/env-client";

export const useProfile = (props: { userId: string }) =>
    createQuery(() => ({
        queryKey: ["profile", props.userId],
        queryFn: async () => {
            const data = await fetch(`${env.PUBLIC_VIDEO_GENERATION_URL}/profile/${props.userId}`);

            return (await data.json()) as {
                top_tracks: Array<{
                    track_id: string;
                    track_name: string;
                    duration: number;
                    album_name: string;
                    album_art: string;
                    artist_name: string;
                    listen_count: number;
                }>;
                total_listen_seconds: number;
                user: {
                    id: string;
                    name: string;
                    image: string;
                };
            };
        },
    }));
