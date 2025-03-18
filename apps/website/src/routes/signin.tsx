import { env } from "~/env";
import { authClient } from "~/utils/auth";

export default function SignIn() {
    const signin = async () => {
        await authClient.signIn.social({
            provider: "spotify",
            callbackURL: env.PUBLIC_APP_URL + "/dashboard",
            errorCallbackURL: env.PUBLIC_APP_URL + "/error",
            newUserCallbackURL: env.PUBLIC_APP_URL + "/welcome",
        });
    };

    return (
        <div>
            <button onClick={signin}>signin</button>
        </div>
    );
}
