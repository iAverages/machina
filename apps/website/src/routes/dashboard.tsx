import { Show } from "solid-js";
import { authClient } from "~/utils/auth";

export default function Dashboard() {
    const session = authClient.useSession();

    return (
        <div>
            dashboard
            <Show when={session()} fallback={<div>you are not logged in</div>}>
                {(session) => <pre>{JSON.stringify(session(), null, 2)}</pre>}
            </Show>
        </div>
    );
}
