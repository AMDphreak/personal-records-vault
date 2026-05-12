import { onCleanup, onMount } from "solid-js";
import { installLifecycleGuards } from "~/lib/privacy-hub";

/** Registers tab unload / visibility listeners for ephemeral provider payloads. */
export default function ClientPrivacyBootstrap() {
  onMount(() => {
    const off = installLifecycleGuards();
    onCleanup(off);
  });
  return null;
}
