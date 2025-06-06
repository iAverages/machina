import Warning from "~icons/lucide/triangle-alert";

export const DefaultNotFoundComponent = () => {
    return (
        <div class="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center p-4">
            <div class="text-center space-y-6">
                <div class="flex justify-center">
                    <div class="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Warning class="h-8 w-8 text-blue-500/60" />
                    </div>
                </div>

                <div class="space-y-2">
                    <h1 class="text-2xl font-bold">404 - Page Not Found</h1>
                    <p class="text-zinc-400">The page you're looking for doesn't exist or has been moved.</p>
                </div>

                <div class="pt-4">
                    <a
                        href="/"
                        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
};
