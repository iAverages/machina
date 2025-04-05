// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: will always exist
mount(() => <StartClient />, document.getElementById("app")!);
