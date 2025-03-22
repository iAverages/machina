import { createAsync, Navigate, type RouteDefinition, type RouteSectionProps } from "@solidjs/router";
import { env } from "~/env-client";
import { trackDataQuery } from "~/utils/get-track-data";

export const route = {
    preload: (props) => {
        // i hate browsers
        if (props.params.slug === "favicon.ico" || !props.params.slug) return;
        return trackDataQuery(props.params.slug, false);
    },
} satisfies RouteDefinition;

export default function Page(props: RouteSectionProps) {
    // biome-ignore lint/style/noNonNullAssertion: can this ever not be a string?
    const data = createAsync(() => trackDataQuery(props.params.slug!, false), {
        deferStream: true,
    });

    return <Navigate href={data()?.og.replace(env.PUBLIC_APP_URL, "") ?? "/not-found"} />;
}
