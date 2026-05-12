import { Button } from "@kobalte/core/button";
import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { clearPrvVeramoBrowserStorage, getOrCreatePrvVeramoAgent } from "~/lib/veramo/agent-browser";
import { isBlind, redactLabel, subscribePrivacy } from "~/lib/privacy-hub";

type CredRow = { hash: string; summary: string };

export default function IdentityPanel() {
  const [did, setDid] = createSignal<string | null>(null);
  const [creds, setCreds] = createSignal<CredRow[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  const [busy, setBusy] = createSignal(false);

  const blind = createMemo(() => isBlind());

  onMount(() => {
    const unsub = subscribePrivacy(() => {
      void refresh();
    });
    onCleanup(unsub);
    void refresh();
  });

  const refresh = async () => {
    setError(null);
    setBusy(true);
    try {
      if (typeof window === "undefined" || isBlind()) {
        setDid(null);
        setCreds([]);
        return;
      }
      const agent = await getOrCreatePrvVeramoAgent();
      let ids = await agent.didManagerFind({});
      if (!ids.length) {
        const created = await agent.didManagerCreate({ provider: "did:key", alias: "prv-browser" });
        ids = [created];
      }
      const active = ids[0].did;
      setDid(active);
      const list = await agent.dataStoreORMGetVerifiableCredentials(
        { order: [{ column: "issuanceDate", direction: "DESC" }] },
        { authorizedDID: active }
      );
      setCreds(
        list.map((c) => ({
          hash: c.hash,
          summary: summarizeCredential(c.verifiableCredential)
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load identity.");
      setDid(null);
      setCreds([]);
    } finally {
      setBusy(false);
    }
  };

  const clearLocalIdentity = () => {
    if (typeof window === "undefined" || blind()) return;
    if (
      !window.confirm(
        "Remove all Veramo DIDs, keys, and stored credentials from this browser profile? This cannot be undone."
      )
    ) {
      return;
    }
    clearPrvVeramoBrowserStorage();
    void refresh();
  };

  const createDid = async () => {
    setBusy(true);
    setError(null);
    try {
      if (isBlind()) return;
      const agent = await getOrCreatePrvVeramoAgent();
      await agent.didManagerCreate({ provider: "did:key", alias: `prv-${Date.now()}` });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create DID.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <h1>Identity (Veramo)</h1>
      <p>
        Local <code>did:key</code> identity and stored credentials form your submission history view. Keys and DIDs stay
        in this browser profile unless you clear site data.
      </p>

      <Show when={blind()}>
        <p class="panel" style={{ "border-color": "#b42318" }}>
          Sensitive views are locked: reconnect your vault folder (USB or local directory) to show identifiers again.
          Provider previews were cleared from memory.
        </p>
      </Show>

      {error() ? <p style={{ color: "#b42318" }}>{error()}</p> : null}

      <div class="hero__actions" style={{ "margin-bottom": "1rem" }}>
        <Button type="button" disabled={busy() || blind()} onClick={() => void refresh()}>
          Refresh
        </Button>
        <Button type="button" disabled={busy() || blind()} onClick={() => void createDid()}>
          Create another DID
        </Button>
        <Button type="button" disabled={busy() || blind()} onClick={clearLocalIdentity}>
          Remove local Veramo data…
        </Button>
      </div>

      <Show when={!blind()}>
        <p>
          Active DID: <code>{redactLabel(did() ?? "")}</code>
        </p>
      </Show>

      <div class="panel">
        <h2>Credential chain (local store)</h2>
        <Show when={busy()}>
          <p>Loading…</p>
        </Show>
        <Show when={!busy() && !creds().length}>
          <p>No verifiable credentials stored yet. When providers issue credentials to this DID, they will appear here.</p>
        </Show>
        <Show when={creds().length > 0}>
          <table class="table">
            <thead>
              <tr>
                <th>Summary</th>
                <th>Hash</th>
              </tr>
            </thead>
            <tbody>
              <For each={creds()}>
                {(row) => (
                  <tr>
                    <td>{blind() ? "withheld" : row.summary}</td>
                    <td>
                      <code>{blind() ? "—" : row.hash.slice(0, 16)}…</code>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </div>
    </section>
  );
}

function summarizeCredential(vc: { type?: string[]; issuer?: { id?: string } | string; credentialSubject?: unknown }): string {
  const types = Array.isArray(vc.type) ? vc.type.filter((t) => t !== "VerifiableCredential").join(", ") : "Credential";
  const iss = typeof vc.issuer === "string" ? vc.issuer : vc.issuer?.id ?? "unknown issuer";
  return `${types} — ${iss}`;
}
