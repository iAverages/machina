import { onMount } from "solid-js";

export const ExternalNavigate = (props: { href: string }) => {
    onMount(() => {
        window.location.href = props.href;
    });

    return null;
};
