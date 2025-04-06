import { cn } from "~/utils/cn";
import { useParams } from "@solidjs/router";
import { createMemo, For } from "solid-js";
import { useRecentTracks } from "~/queries/recent-tracks";
import { Track } from "./track";
import { useInView } from "~/hooks/use-in-view";

export function RecentTracks(props: { class?: string }) {
    const params = useParams();
    // biome-ignore lint/style/noNonNullAssertion:
    const recent = useRecentTracks({ userId: params.userId! });

    const tracks = createMemo(() => {
        return recent.data?.pages?.flatMap((p) => p.data) ?? [];
    });

    const { ref: notifcationsScrollRef } = useInView(
        () => {
            if (recent.hasNextPage) recent.fetchNextPage();
        },
        undefined,
        { rootMargin: "20px" },
    );

    return (
        <div class={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full", props.class)}>
            <For each={tracks()}>{(song) => <Track {...song} />}</For>
            <div ref={notifcationsScrollRef} />
        </div>
    );
}
