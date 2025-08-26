import { useMutation } from "@tanstack/solid-query";
import { ingestListensMutation } from "~/api/client/@tanstack/solid-query.gen";

export const useSpotifyIngest = () =>
    useMutation(() => ({
        ...ingestListensMutation(),
    }));
