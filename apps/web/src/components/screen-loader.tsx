import Loader from "~icons/lucide/loader-circle";

export const ScreenLoader = () => (
    <div class="min-h-dvh bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center p-4">
        <div class="text-center space-y-6">
            <Loader class="animate-spin size-8" />
        </div>
    </div>
);
