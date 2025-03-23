import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/utils/cn";
import { useProfile } from "~/queries/profile";
import { useParams } from "@solidjs/router";

interface UserProfileProps {
    class?: string;
}

export function UserProfile(props: UserProfileProps) {
    const params = useParams();
    // biome-ignore lint/style/noNonNullAssertion: hush
    const profile = useProfile({ userId: params.userId! });

    return (
        <Card class={cn("border-none", props.class)}>
            <CardHeader />
            <CardContent>
                <div class="flex flex-col md:flex-row items-center gap-6">
                    <Avatar class="size-24">
                        <AvatarImage
                            class="object-cover"
                            src={profile.data?.user.image}
                            alt={profile.data?.user.name}
                        />
                        <AvatarFallback>{profile.data?.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <h2 class="text-2xl font-bold">{profile.data?.user.name}</h2>
                            {/* <p class="text-muted-foreground">@{user.username}</p> */}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
