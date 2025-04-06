import { useInfiniteQuery } from "@tanstack/solid-query";
import { listenHistInfiniteOptions } from "~/api/client/@tanstack/solid-query.gen";

export const useRecentTracks = (props: { userId: string }) =>
    useInfiniteQuery(() => ({
        ...listenHistInfiniteOptions({ path: { id: props.userId } }),
        refetchInterval: 60 * 2 * 1000,
        getNextPageParam: (page) => page.cursor,
    }));
