import { useMutation } from "@tanstack/solid-query";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { Match, Show, Switch } from "solid-js";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { env } from "~/env-client";
import { SpotifyIcon } from "~/icons/external";
import { authClient } from "~/utils/auth";
import Music from "~icons/lucide/music";

export const Route = createFileRoute("/signin")({
    component: RouteComponent,
    validateSearch: z.object({
        error: z.enum(["authserver_unavailable", "auth_required"]).optional(),
        goto: z.string().startsWith("/").optional(),
    }),
});

function RouteComponent() {
    const searchParams = Route.useSearch();

    // TODO: replace this with a popup
    const { mutate: signin, isPending: isLoading } = useMutation(() => ({
        mutationKey: ["signin"],
        mutationFn: async () => {
            const goto = searchParams().goto ? searchParams().goto : "/dashboard";

            await authClient.signIn.social({
                provider: "spotify",
                callbackURL: `${env.PUBLIC_APP_URL}${goto}`,
                errorCallbackURL: `${env.PUBLIC_APP_URL}/error`,
                newUserCallbackURL: `${env.PUBLIC_APP_URL}/dashboard/welcome`,
            });
        },
    }));

    return (
        <div class="flex min-h-screen flex-col items-center justify-center bg-black text-white gap-6">
            <Show when={searchParams().error}>
                {(error) => (
                    <div class="max-w-md w-full">
                        <Switch>
                            <Match when={error() === "auth_required"}>
                                <Alert variant={"destructive"}>
                                    <AlertTitle>Authentication Required</AlertTitle>
                                    <AlertDescription>
                                        Please login to your account to access this page
                                    </AlertDescription>
                                </Alert>
                            </Match>

                            <Match when={error() === "authserver_unavailable"}>
                                <Alert variant={"destructive"}>
                                    <AlertTitle>Authentication Error</AlertTitle>
                                    <AlertDescription>
                                        We are having some issues logging you in currently, please try again shortly.
                                    </AlertDescription>
                                </Alert>
                            </Match>
                        </Switch>
                    </div>
                )}
            </Show>
            <div class="w-full max-w-md space-y-8 rounded-xl bg-zinc-900 p-8 shadow-xl">
                <div class="flex flex-col items-center justify-center space-y-2 text-center">
                    <div class="flex items-center justify-center rounded-full bg-green-500 p-2">
                        <Music class="h-8 w-8 text-black" />
                    </div>
                    <h1 class="text-3xl font-bold">Machina</h1>
                    <p class="text-zinc-400">Track your listening habits and discover insights</p>
                </div>

                <div class="space-y-4">
                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <span class="w-full border-t border-zinc-700" />
                        </div>
                        <div class="relative flex justify-center text-xs uppercase">
                            <span class="bg-zinc-900 px-2 text-zinc-400">Sign in with</span>
                        </div>
                    </div>

                    <Button
                        onClick={() => signin()}
                        disabled={isLoading}
                        class="w-full bg-green-500 cursor-pointer text-black hover:bg-green-600 flex items-center justify-center gap-2 py-6"
                    >
                        {isLoading ? (
                            <div class="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                        ) : (
                            <>
                                <SpotifyIcon />
                                Continue with Spotify
                            </>
                        )}
                    </Button>

                    <p class="text-center text-xs text-zinc-500">
                        By signing in, you agree to our{" "}
                        <Link to="/terms" class="underline underline-offset-2 hover:text-zinc-300">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" class="underline underline-offset-2 hover:text-zinc-300">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
