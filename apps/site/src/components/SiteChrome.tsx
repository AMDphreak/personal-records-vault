import { A } from "@solidjs/router";
import type { ParentProps } from "solid-js";
import { Button } from "@kobalte/core/button";
import { clearSession, readSession } from "~/lib/session";

export default function SiteChrome(props: ParentProps) {
  const session = () => readSession();

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
          <A href="/app" class="chrome__link">
            Web vault
          </A>
          {session() ? (
            <Button class="chrome__btn" onClick={() => clearSession()}>
              Sign out
            </Button>
          ) : null}
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
