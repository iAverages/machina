import { createFileRoute, Outlet, redirect } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { getHeaders } from "@tanstack/solid-start/server";
import { ScreenLoader } from "~/components/screen-loader";
import { authClient } from "~/utils/auth";

const getSession = createServerFn().handler(async () => {
    const headers = getHeaders();
    const session = await authClient.getSession({
        fetchOptions: {
            headers: headers.cookie
                ? {
                      cookie: headers.cookie,
                  }
                : undefined,
        },
    });

    return session;
});

export const Route = createFileRoute("/dashboard")({
    ssr: true,
    component: RouteComponent,
    beforeLoad: async ({ location }) => {
        const session = await getSession();
        await new Promise((res) => setTimeout(res, 1000));
        if (!session) {
            throw redirect({
                to: "/signin",
                search: {
                    error: "auth_required",
                    goto: location.href,
                },
            });
        }

        if (session.error !== null) {
            throw redirect({
                to: "/signin",
                search: {
                    error: "authserver_unavailable",
                    goto: location.href,
                },
            });
        }

        if (!session.data) {
            throw redirect({
                to: "/signin",
                search: {
                    error: "auth_required",
                    goto: location.href,
                },
            });
        }
        console.log(`letting ${session.data.user.id} access dashboard`);

        return { auth: session.data };
    },
    loader: ({ context }) => context.auth,
    pendingComponent: ScreenLoader,
});

function RouteComponent() {
    return <Outlet />;
}
