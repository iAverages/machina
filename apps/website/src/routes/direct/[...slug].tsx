import { createAsync, Navigate, RouteDefinition, RouteSectionProps } from "@solidjs/router";
import { env } from "~/env";
import { trackDataQuery } from "~/utils/get-track-data";

export const route = {
    preload: (props) => {
        // i hate browsers
        if (props.params.slug === "favicon.ico" || !props.params.slug) return;
        return trackDataQuery(props.params.slug, false);
    },
} satisfies RouteDefinition;

export default function Page(props: RouteSectionProps) {
    const data = createAsync(() => trackDataQuery(props.params.slug!, false), {
        deferStream: true,
    });

    return <Navigate href={data()?.og.replace(env.PUBLIC_APP_URL, "") ?? "/not-found"} />;
}
