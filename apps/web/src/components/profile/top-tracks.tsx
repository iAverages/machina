import { createMemo, createSignal, For, Show } from "solid-js";
import { useProfile } from "~/queries/profile";
import { cn } from "~/utils/cn";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleTrigger } from "../ui/collapsible";
import { TopTrack } from "./track";

type TopSongsProps = {
    timeRange: string;
    class?: string;
    userId: string;
};

export function TopSongs(props: TopSongsProps) {
    const [showMore, setShowMore] = createSignal(false);
    const profile = useProfile({ userId: props.userId });

    const firstTop = createMemo(() => {
        return profile.data?.topTracks?.slice(0, 6) ?? [];
    });

    const secondTop = createMemo(() => {
        return profile.data?.topTracks?.slice(6) ?? [];
    });

    const buttonLabel = createMemo(() => (showMore() ? "Show Less" : "Show More"));

    return (
        <Collapsible open={showMore()} onOpenChange={setShowMore} class="flex gap-2 flex-col">
            <div class={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2", props.class)}>
                <For each={firstTop()}>{(song) => <TopTrack {...song} />}</For>
                <Show when={showMore()}>
                    <For each={secondTop()}>{(song) => <TopTrack {...song} />}</For>
                </Show>
            </div>
            <CollapsibleTrigger class={"self-end w-fit cursor-pointer"} as={Button}>
                {buttonLabel()}
            </CollapsibleTrigger>
        </Collapsible>
    );
}
