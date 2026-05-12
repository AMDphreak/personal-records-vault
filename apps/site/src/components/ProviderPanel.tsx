import { Button } from "@kobalte/core/button";
import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { listEphemeral, pushEphemeral, subscribeEphemeral, clearEphemeral } from "~/lib/ephemeral-provider";
import {
  expungeSensitiveState,
  isBlind,
  subscribePrivacy
} from "~/lib/privacy-hub";
import { fetchProviderExport, getActiveSubjectDid } from "~/lib/provider-client";
import { mergeEphemeralIntoVault } from "~/lib/vault-merge";

function defaultDemoExportUrl(): string {
  if (typeof window === "undefined" || !window.location?.origin) {
    return "/prv-demo-provider.json";
  }
  return new URL("/prv-demo-provider.json", window.location.origin).href;
}

export default function ProviderPanel() {
  const [url, setUrl] = createSignal(defaultDemoExportUrl());
  const [error, setError] = createSignal<string | null>(null);
  const [busy, setBusy] = createSignal(false);
  const [blobs, setBlobs] = createSignal(listEphemeral());
  const [previewId, setPreviewId] = createSignal<string | null>(null);

  const blind = createMemo(() => isBlind());

  onMount(() => {
    setUrl(defaultDemoExportUrl());
    const u1 = subscribeEphemeral(() => setBlobs(listEphemeral()));
    const u2 = subscribePrivacy(() => setBlobs(listEphemeral()));
    onCleanup(() => {
      u1();
      u2();
    });
  });

  const requestExport = async () => {
    setError(null);
    if (isBlind()) {
      setError("Vault trust was lost — reconnect storage before requesting provider data.");
      return;
    }
    setBusy(true);
    try {
      const did = await getActiveSubjectDid();
      const body = await fetchProviderExport({ exportBaseUrl: url(), subjectDid: did });
      const label = (() => {
        try {
          return new URL(url(), window.location.href).hostname;
        } catch {
          return "provider";
        }
      })();
      pushEphemeral(label, body);
      setBlobs(listEphemeral());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed (check CORS and URL).");
    } finally {
      setBusy(false);
    }
  };

  const mergeOne = async (id: string) => {
    setError(null);
    try {
      await mergeEphemeralIntoVault(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed.");
    }
  };

  const preview = () => blobs().find((b) => b.id === previewId());

  return (
    <section>
      <h1>Provider data</h1>
      <p>
        Request an export from a provider URL (GET with <code>subjectDid</code> query). The response is held in memory
        for a short TTL, then dropped. Merge appends JSON lines to <code>prv-provider-merge.jsonl</code> in your
        selected vault folder. A same-origin demo file is pre-filled (<code>/prv-demo-provider.json</code>) so you can
        try the flow without a third-party server.
      </p>

      <Show when={blind()}>
        <p class="panel" style={{ "border-color": "#b42318" }}>
          Requests are disabled until you reconnect a trusted vault folder.
        </p>
      </Show>

      {error() ? <p style={{ color: "#b42318" }}>{error()}</p> : null}

      <div class="form__field">
        <label class="label" for="exportUrl">
          Provider export base URL
        </label>
        <input
          class="input"
          id="exportUrl"
          value={url()}
          disabled={blind()}
          onInput={(e) => setUrl(e.currentTarget.value)}
        />
      </div>
      <div class="hero__actions">
        <Button type="button" disabled={busy() || blind()} onClick={() => void requestExport()}>
          Request export
        </Button>
        <Button
          type="button"
          disabled={blind()}
          onClick={() => {
            clearEphemeral();
            setBlobs(listEphemeral());
          }}
        >
          Clear in-memory copies
        </Button>
        <Button type="button" disabled={blind()} onClick={() => expungeSensitiveState("user cleared sensitive state")}>
          Lock &amp; expunge session data
        </Button>
      </div>

      <div class="panel">
        <h2>In-memory provider snapshots</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Age</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <For each={blobs()}>
              {(b) => (
                <tr>
                  <td>{blind() ? "withheld" : b.label}</td>
                  <td>{Math.round((Date.now() - b.createdAt) / 1000)}s</td>
                  <td class="hero__actions">
                    <Button type="button" disabled={blind()} onClick={() => setPreviewId(b.id)}>
                      Preview
                    </Button>
                    <Button type="button" disabled={blind()} onClick={() => void mergeOne(b.id)}>
                      Merge into vault
                    </Button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <Show when={!blobs().length}>
          <p>No snapshots yet.</p>
        </Show>
      </div>

      <Show when={preview() && !blind()}>
        <div class="panel">
          <h3>Temporary preview</h3>
          <pre style={{ "max-height": "320px", overflow: "auto", "font-size": "0.85rem" }}>{preview()?.body}</pre>
        </div>
      </Show>
    </section>
  );
}
