import { useLocation, useNavigate, useResolvedPath } from "@solidjs/router";
import { createEffect, type JSX, Match, Suspense, Switch } from "solid-js";
import { ScreenLoader } from "~/components/screen-loader";
import { authClient } from "~/utils/auth";
import Warning from "~icons/lucide/triangle-alert";

export default function Dashboard(props: { children: JSX.Element }) {
    const session = authClient.useSession();
    const nav = useNavigate();
    const location = useLocation();

    createEffect(() => {
        // we are not signed in in this state
        if (!session().isPending && !session().data && !session().error) {
            nav(`/signin?goto=${encodeURIComponent(JSON.stringify(location))}`);
            return;
        }
    });

    return (
        <Switch
            fallback={
                <div class="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center p-4">
                    <div class="text-center space-y-6">
                        <div class="flex justify-center">
                            <div class="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Warning class="h-8 w-8 text-red-500/60" />
                            </div>
                        </div>

                        <div class="space-y-2">
                            <h1 class="text-2xl font-bold">Unknown error has occured</h1>
                            <p class="text-zinc-400">
                                An unknown error has occured, if this continues, please report this.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Match when={session().error}>
                <div class="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center p-4">
                    <div class="text-center space-y-6">
                        <div class="flex justify-center">
                            <div class="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Warning class="h-8 w-8 text-red-500/60" />
                            </div>
                        </div>

                        <div class="space-y-2">
                            <h1 class="text-2xl font-bold">Authentication Error</h1>
                            <p class="text-zinc-400">An error has occured while authenticating, please try agian.</p>
                        </div>
                    </div>
                </div>
            </Match>
            <Match when={session().isPending || (!session().isPending && !session().data && !session().error)}>
                <ScreenLoader />
            </Match>
            <Match when={session().data}>
                {(data) => <Suspense fallback={<ScreenLoader />}>{props.children}</Suspense>}
            </Match>
        </Switch>
    );
}
