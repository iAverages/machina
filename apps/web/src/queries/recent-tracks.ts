import { createInfiniteQuery } from "@tanstack/solid-query";
import { api } from "~/api";

export const useRecentTracks = (props: { userId: string }) =>
    createInfiniteQuery(() => ({
        queryKey: ["profile", props.userId, "histroy"],
        refetchInterval: 60 * 2 * 1000,
        queryFn: async ({ pageParam }) => {
            const page = Number.parseInt(pageParam);
            const cursor = page > 0 ? page : undefined;
            return api.listenHist({
                id: props.userId,
                cursor,
            });
        },
        initialPageParam: "-1",
        getNextPageParam: (page) => page.cursor?.toString(),
    }));
