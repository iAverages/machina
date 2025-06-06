import { useQuery } from "@tanstack/solid-query";
import { selfProfileOptions, userProfileOptions } from "~/api/client/@tanstack/solid-query.gen";

export const useProfile = (props: { userId: string }) =>
    useQuery(() => ({
        ...userProfileOptions({ path: { id: props.userId } }),
        refetchInterval: 30 * 1000,
        refetchOnWindowFocus: true,
        deferStream: true,
    }));

export const getSelfProfileQueryOptions = {
    ...selfProfileOptions(),
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    deferStream: true,
};

export const useSelfProfile = () =>
    useQuery(() => ({
        ...selfProfileOptions(),
        refetchInterval: 30 * 1000,
        refetchOnWindowFocus: true,
        deferStream: true,
    }));
