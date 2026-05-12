// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

// Vinxi client router re-exports `default` from this module (`$vinxi/handler/client`).
export default mount(() => <StartClient />, document.getElementById("app")!);
