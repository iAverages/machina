import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/utils/cn";
import { useProfile } from "~/queries/profile";
import { useParams } from "@solidjs/router";
import { CurrentlyListening } from "./currently-listening";

interface UserProfileProps {
    class?: string;
}

export function UserProfile(props: UserProfileProps) {
    const params = useParams();
    // biome-ignore lint/style/noNonNullAssertion: hush
    const profile = useProfile({ userId: params.userId! });

    return (
        <Card class={cn("border-none", props.class)}>
            <CardContent class="p-6">
                <div class="flex flex-col lg:flex-row gap-6 justify-between">
                    <div class="flex items-center gap-6">
                        <Avatar class="size-24 md:size-28">
                            <AvatarImage
                                class="object-cover"
                                src={profile.data?.user.image ?? ""}
                                alt={profile.data?.user.name}
                            />
                            <AvatarFallback>{profile.data?.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div class="space-y-4 text-center md:text-left lg:text-center w-full">
                            <div class="space-y-1">
                                <h2 class="text-4xl font-extrabold">{profile.data?.user.name}</h2>
                            </div>
                        </div>
                    </div>
                    <CurrentlyListening />
                </div>
            </CardContent>
        </Card>
    );
}
