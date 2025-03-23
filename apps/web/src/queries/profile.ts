import { createQuery } from "@tanstack/solid-query";
import { api } from "~/api";

export const useProfile = (props: { userId: string }) =>
    createQuery(() => ({
        queryKey: ["profile", props.userId],
        queryFn: async () => {
            return api.userProfile({
                id: props.userId,
            });
        },
    }));
