import { createQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { getColorPalette } from "~/queries/color-palette";

export const useVibrant = (props: { src: Accessor<string> }) => {
    const data = createQuery(() => ({
        placeholderData: (previousData) => previousData,
        queryKey: ["color-palette", props.src()],
        deferStream: true,
        queryFn: async () => {
            return getColorPalette(props.src());
        },
    }));

    return () => data.data;
};
