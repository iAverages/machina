import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import { useProfile } from "~/queries/profile";
import { cn } from "~/utils/cn";
import { CurrentlyListening } from "./currently-listening";

interface UserProfileProps {
    class?: string;
    userId: string;
}

export function UserProfile(props: UserProfileProps) {
    const profile = useProfile({ userId: props.userId });

    return (
        <Card class={cn("border-none bg-transparent shadow-none", props.class)}>
            <CardContent class="p-6">
                <div class="flex flex-col lg:flex-row gap-6 justify-between">
                    <div class="flex md:justify-normal justify-center items-center gap-6">
                        <Avatar class="size-24 md:size-28">
                            {/* AvatarImage has an issue where it flashes the fallback for a second */}
                            <img
                                class="object-cover"
                                src={profile.data?.user.image ?? ""}
                                alt={profile.data?.user.name}
                            />
                            <AvatarFallback>{profile.data?.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div class="space-y-4 text-left lg:text-center w-full">
                            <div class="space-y-1">
                                <h2 class="text-4xl font-extrabold">{profile.data?.user.name}</h2>
                            </div>
                        </div>
                    </div>
                    <CurrentlyListening userId={props.userId} />
                </div>
            </CardContent>
        </Card>
    );
}
