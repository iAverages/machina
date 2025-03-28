import { createQuery } from "@tanstack/solid-query";
import { api } from "~/api";

export const useProfile = (props: { userId: string }) =>
    createQuery(() => ({
        queryKey: ["profile", props.userId],
        refetchInterval: 30 * 1000,
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
    }));
