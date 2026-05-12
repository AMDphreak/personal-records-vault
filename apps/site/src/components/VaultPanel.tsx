import { Button } from "@kobalte/core/button";
import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import {
  attachVaultDirectory,
  expungeSensitiveState,
  isBlind,
  isStrictPublicSession,
  redactLabel,
  setStrictPublicSession,
  subscribePrivacy,
  watchBluetoothDisconnect
} from "~/lib/privacy-hub";

type EntryRow = { name: string; kind: "file" | "directory" };

export default function VaultPanel() {
  const [supported, setSupported] = createSignal(false);
  const [folderName, setFolderName] = createSignal<string | null>(null);
  const [entries, setEntries] = createSignal<EntryRow[]>([]);
  const [mergeTail, setMergeTail] = createSignal<string | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [strictPublic, setStrictPublic] = createSignal(false);
  const [btNote, setBtNote] = createSignal<string | null>(null);

  const blind = createMemo(() => isBlind());

  onMount(() => {
    setSupported(typeof window !== "undefined" && "showDirectoryPicker" in window);
    setStrictPublic(isStrictPublicSession());
    const unsub = subscribePrivacy(() => {
      setStrictPublic(isStrictPublicSession());
      if (isBlind()) {
        setFolderName(null);
        setEntries([]);
        setMergeTail(null);
      }
    });
    onCleanup(unsub);
  });

  const loadEntries = async (dir: FileSystemDirectoryHandle) => {
    const list: EntryRow[] = [];
    for await (const [name, handle] of dir.entries()) {
      list.push({ name, kind: handle.kind });
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    setEntries(list);
  };

  const loadMergePreview = async (dir: FileSystemDirectoryHandle) => {
    try {
      const fh = await dir.getFileHandle("prv-provider-merge.jsonl").catch(() => null);
      if (!fh) {
        setMergeTail(null);
        return;
      }
      const file = await fh.getFile();
      const text = await file.text();
      const tail = text.length > 6000 ? text.slice(-6000) : text;
      setMergeTail(tail || null);
    } catch {
      setMergeTail(null);
    }
  };

  const openFolder = async () => {
    setError(null);
    setEntries([]);
    setFolderName(null);
    setMergeTail(null);
    if (!("showDirectoryPicker" in window)) {
      setError("This browser does not expose the File System Access API. Try Chrome or Edge, or use the desktop app.");
      return;
    }
    try {
      const dir = await (
        window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }
      ).showDirectoryPicker();
      await dir.requestPermission({ mode: "readwrite" });
      attachVaultDirectory(dir);
      setFolderName(dir.name);
      await loadEntries(dir);
      await loadMergePreview(dir);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read the selected folder.");
    }
  };

  const disconnectVault = () => {
    attachVaultDirectory(null);
    setFolderName(null);
    setEntries([]);
    setMergeTail(null);
  };

  const toggleStrict = (next: boolean) => {
    setStrictPublicSession(next);
    setStrictPublic(next);
  };

  let btTeardown: (() => void) | null = null;
  const armBluetooth = async () => {
    setBtNote(null);
    setError(null);
    try {
      if (btTeardown) {
        btTeardown();
        btTeardown = null;
      }
      btTeardown = await watchBluetoothDisconnect(() => {
        expungeSensitiveState("bluetooth device disconnected");
        setBtNote("Bluetooth device disconnected — temporary data cleared.");
      });
      setBtNote("Watching Bluetooth device. Disconnect it to lock the session.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bluetooth setup failed.");
    }
  };

  return (
    <section>
      <h1>Web vault</h1>
      <p>
        Pick a folder on disk (for example a USB-backed copy of your vault). Filenames are listed locally in your
        browser; nothing is uploaded to Netlify. If the folder becomes unreachable (USB removed or permission revoked),
        the site clears in-memory provider copies and hides identifiers until you reconnect.
      </p>

      <div class="panel" style={{ "margin-bottom": "1rem" }}>
        <label style={{ display: "flex", "gap": "0.5rem", "align-items": "center" }}>
          <input
            type="checkbox"
            checked={strictPublic()}
            onChange={(e) => toggleStrict(e.currentTarget.checked)}
          />
          Strict public computer mode (clear sensitive session when you hide this tab)
        </label>
      </div>

      <Show when={blind()}>
        <p class="panel" style={{ "border-color": "#b42318" }}>
          Vault trust is <strong>locked</strong>. Re-open your vault folder to continue viewing DIDs, previews, and
          provider requests.
        </p>
      </Show>

      {btNote() ? <p class="panel">{btNote()}</p> : null}
      {error() ? <p style={{ color: "#b42318" }}>{error()}</p> : null}

      <Show
        when={supported()}
        fallback={
          <p class="panel">
            Folder picking is not available in this browser profile. Use the desktop app for full USB workflows.
          </p>
        }
      >
        <div class="hero__actions" style={{ "margin-bottom": "1rem" }}>
          <Button type="button" onClick={() => void openFolder()}>
            Open vault folder…
          </Button>
          <Button type="button" onClick={() => disconnectVault()}>
            Disconnect vault
          </Button>
          <Button type="button" onClick={() => void armBluetooth()}>
            Arm Bluetooth disconnect watcher…
          </Button>
        </div>
      </Show>

      <Show when={folderName()}>
        <p>
          Selected folder: <strong>{redactLabel(folderName())}</strong>
        </p>
      </Show>

      <Show when={entries().length > 0}>
        <div class="panel">
          <h2>Entries</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Kind</th>
              </tr>
            </thead>
            <tbody>
              <For each={blind() ? [] : entries()}>
                {(row) => (
                  <tr>
                    <td>{row.name}</td>
                    <td>
                      <span class="badge">{row.kind}</span>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
          <Show when={blind()}>
            <p>Entry names withheld while the vault is locked.</p>
          </Show>
        </div>
      </Show>

      <Show when={mergeTail() && !blind()}>
        <div class="panel">
          <h2>Private merge log (tail of prv-provider-merge.jsonl)</h2>
          <pre style={{ "max-height": "240px", overflow: "auto", "font-size": "0.85rem" }}>{mergeTail()}</pre>
        </div>
      </Show>
    </section>
  );
}
