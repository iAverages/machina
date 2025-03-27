import { createQuery, queryOptions } from "@tanstack/solid-query";
import { api } from "~/api";

export const profileQueryOptions = (props: { userId: string }) =>
    queryOptions({
        queryKey: ["profile", props.userId],
        refetchOnWindowFocus: true,
        deferStream: true,
        queryFn: () => {
            try {
                return api.userProfile({
                    id: props.userId,
                });
            } catch (e) {
                console.log("error from profile", e);
                throw e;
            }
        },
    });

export const useProfile = (props: { userId: string }) => createQuery(() => profileQueryOptions(props));
