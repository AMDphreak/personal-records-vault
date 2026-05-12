import { Button } from "@kobalte/core/button";
import { createSignal, For, onMount, Show } from "solid-js";

type EntryRow = { name: string; kind: "file" | "directory" };

export default function VaultPanel() {
  const [supported, setSupported] = createSignal(false);
  const [folderName, setFolderName] = createSignal<string | null>(null);
  const [entries, setEntries] = createSignal<EntryRow[]>([]);
  const [error, setError] = createSignal<string | null>(null);

  onMount(() => {
    setSupported(typeof window !== "undefined" && "showDirectoryPicker" in window);
  });

  const openFolder = async () => {
    setError(null);
    setEntries([]);
    setFolderName(null);
    if (!("showDirectoryPicker" in window)) {
      setError("This browser does not expose the File System Access API. Try Chrome or Edge, or use the desktop app.");
      return;
    }
    try {
      const dir = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
      setFolderName(dir.name);
      const list: EntryRow[] = [];
      for await (const [name, handle] of dir.entries()) {
        list.push({ name, kind: handle.kind });
      }
      list.sort((a, b) => a.name.localeCompare(b.name));
      setEntries(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read the selected folder.");
    }
  };

  return (
    <section>
      <h1>Web vault</h1>
      <p>
        Pick a folder on disk (for example a USB-backed copy of your vault). Filenames are listed locally in your
        browser; nothing is uploaded to Netlify.
      </p>

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
        </div>
      </Show>

      {error() ? <p style={{ color: "#b42318" }}>{error()}</p> : null}

      <Show when={folderName()}>
        {(name) => (
          <p>
            Selected folder: <strong>{name()}</strong>
          </p>
        )}
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
              <For each={entries()}>
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
        </div>
      </Show>
    </section>
  );
}
