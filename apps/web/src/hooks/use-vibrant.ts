import { useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { env } from "~/env-client";

export const useVibrant = (props: { src: Accessor<string> }) => {
    const data = useQuery(() => ({
        placeholderData: (previousData) => previousData,
        queryKey: ["color-palette", props.src()],
        deferStream: true,
        queryFn: async () => {
            const data = await fetch(`${env.PUBLIC_APP_URL}/iapi/color-palette?url=${encodeURIComponent(props.src())}`);

            return data.json();
        },
    }));

    return () => data.data;
};
