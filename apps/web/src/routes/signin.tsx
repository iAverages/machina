import { A, useSearchParams } from "@solidjs/router";
import { useMutation } from "@tanstack/solid-query";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { env } from "~/env-client";
import { SpotifyIcon } from "~/icons/external";
import { authClient } from "~/utils/auth";
import Music from "~icons/lucide/music";

const locationSchema = z.object({
    pathname: z.string(),
    search: z.string(),
});

export default function SignIn() {
    const [searchParams] = useSearchParams();

    // TODO: replace this with a popup
    const { mutate: signin, isPending: isLoading } = useMutation(() => ({
        mutationKey: ["signin"],
        mutationFn: async () => {
            const validator = locationSchema.safeParse(searchParams);
            const goto = validator.success ? validator.data.pathname : `${env.PUBLIC_APP_URL}/dashboard`;

            await authClient.signIn.social({
                provider: "spotify",
                callbackURL: goto,
                errorCallbackURL: `${env.PUBLIC_APP_URL}/error`,
                newUserCallbackURL: `${env.PUBLIC_APP_URL}/welcome`,
            });
        },
    }));

    return (
        <div class="flex min-h-screen flex-col items-center justify-center bg-black text-white">
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
                        <A href="/terms" class="underline underline-offset-2 hover:text-zinc-300">
                            Terms of Service
                        </A>{" "}
                        and{" "}
                        <A href="/privacy" class="underline underline-offset-2 hover:text-zinc-300">
                            Privacy Policy
                        </A>
                    </p>
                </div>
            </div>
        </div>
    );
}
