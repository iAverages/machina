import FileX from "~icons/lucide/file-x";

export const DefaultErrorComponent = () => {
    return (
        <div class="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center p-4">
            <div class="text-center space-y-6">
                <div class="flex justify-center">
                    <div class="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                        <FileX class="h-8 w-8 text-red-500/60" />
                    </div>
                </div>

                <div class="space-y-2">
                    <h1 class="text-2xl font-bold">Unknown Error</h1>
                    <p class="text-zinc-400">An unknown error has occured, please try agian.</p>
                </div>
            </div>
        </div>
    );
};
