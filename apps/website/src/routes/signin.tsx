import { authClient } from "~/utils/auth";

export default function SignIn() {
    const signin = async () => {
        await authClient.signIn.social({
            provider: "spotify",
            callbackURL: "/dashboard",
            errorCallbackURL: "/error",
            newUserCallbackURL: "/welcome",
        });
    };

    return (
        <div>
            <button onClick={signin}>signin</button>
        </div>
    );
}
