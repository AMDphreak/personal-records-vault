import { A } from "@solidjs/router";
import type { ParentProps } from "solid-js";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { Button } from "@kobalte/core/button";
import { isBlind, subscribePrivacy } from "~/lib/privacy-hub";
import { clearSession, readSession } from "~/lib/session";

export default function SiteChrome(props: ParentProps) {
  const [privacyEpoch, setPrivacyEpoch] = createSignal(0);

  onMount(() => {
    const off = subscribePrivacy(() => setPrivacyEpoch((n) => n + 1));
    onCleanup(off);
  });

  const session = () => {
    void privacyEpoch();
    return readSession();
  };

  const sessionHint = () => {
    void privacyEpoch();
    const s = readSession();
    if (!s) return null;
    if (isBlind()) return "Signed in (identity withheld)";
    return `Signed in as ${s.email}`;
  };

  return (
    <div class="chrome">
      <header class="chrome__header">
        <div class="chrome__brand">
          <A href="/" class="chrome__logo">
            Personal Records Vault
          </A>
          <span class="chrome__tag">static preview</span>
        </div>
        <nav class="chrome__nav">
          <A href="/download" class="chrome__link">
            Downloads
          </A>
          <A href="/login" class="chrome__link">
            Web sign-in
          </A>
          <A href="/identity" class="chrome__link">
            Identity
          </A>
          <A href="/providers" class="chrome__link">
            Providers
          </A>
          <A href="/app" class="chrome__link">
            Web vault
          </A>
          <Show when={session()}>
            <span class="chrome__link" style={{ opacity: "0.85" }}>
              {sessionHint()}
            </span>
            <Button class="chrome__btn" onClick={() => clearSession()}>
              Sign out
            </Button>
          </Show>
        </nav>
      </header>
      <main class="chrome__main">{props.children}</main>
      <footer class="chrome__footer">
        <p>
          Experimental project — not a medical device. Prefer the desktop app for full vault features and USB
          workflows.
        </p>
      </footer>
    </div>
  );
}
