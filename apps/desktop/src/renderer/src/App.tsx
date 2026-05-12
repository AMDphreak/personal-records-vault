import type { Component } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'
import Versions from './components/Versions'

type DemoNode = {
  id: string
  label: string
  kind: string
  children?: DemoNode[]
}

const demoGraph: DemoNode = {
  id: 'person:root',
  label: 'You',
  kind: 'person',
  children: [
    {
      id: 'clinical:immunization',
      label: 'Immunizations',
      kind: 'clinical',
      children: [{ id: 'clinical:flu-2024', label: 'Influenza (2024)', kind: 'event' }]
    },
    {
      id: 'admin:residence',
      label: 'Residential history',
      kind: 'admin',
      children: [
        { id: 'addr:1', label: 'Seattle, WA (2021–present)', kind: 'address' },
        { id: 'addr:2', label: 'Austin, TX (2017–2021)', kind: 'address' }
      ]
    }
  ]
}

const GraphNode: Component<{ node: DemoNode; depth: number }> = (props) => {
  return (
    <div class="graph-node" style={{ 'margin-left': props.depth === 0 ? '0' : '0' }}>
      <div class="row">
        <span class="pill">{props.node.kind}</span>
        <strong>{props.node.label}</strong>
      </div>
      <small class="muted">{props.node.id}</small>
      <Show when={props.node.children && props.node.children.length > 0}>
        <div class="graph-children">
          <For each={props.node.children}>{(child) => <GraphNode node={child} depth={props.depth + 1} />}</For>
        </div>
      </Show>
    </div>
  )
}

const App: Component = () => {
  const [vaultPath, setVaultPath] = createSignal<string | null>(null)
  const [error, setError] = createSignal<string | null>(null)

  const pickLocation = async (): Promise<void> => {
    setError(null)
    try {
      const selected = await window.api.pickVaultLocation()
      setVaultPath(selected)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  return (
    <div class="app-shell">
      <header class="app-header">
        <h1>Personal Records Vault</h1>
        <p>
          Local-first shell: choose a USB-backed file or folder, then visualize structured history (demo graph
          below).
        </p>
      </header>

      <main class="app-main">
        <section class="panel">
          <h2>Primary data location</h2>
          <p class="muted">
            Plug in a USB drive, then pick the vault file or folder. This build only stores the path in memory.
          </p>
          <div class="row" style={{ 'margin-top': '0.75rem' }}>
            <button type="button" onClick={() => void pickLocation()}>
              Choose file or folder…
            </button>
            <Show when={vaultPath()}>
              {(path) => (
                <span class="mono" title={path()}>
                  {path()}
                </span>
              )}
            </Show>
          </div>
          <Show when={error()}>
            {(message) => (
              <p style={{ color: '#ffb4b4', 'margin-top': '0.75rem' }} role="alert">
                {message()}
              </p>
            )}
          </Show>
          <p class="muted" style={{ 'margin-top': '0.85rem' }}>
            solid-ui is installed for future UI primitives; this screen uses plain HTML controls for now.
          </p>
        </section>

        <section class="panel">
          <h2>Record graph (demo)</h2>
          <p class="muted">Placeholder visualization for nested entities. Replace with ELK, canvas, or WebGL later.</p>
          <div class="graph">
            <GraphNode node={demoGraph} depth={0} />
          </div>
        </section>
      </main>

      <footer class="footer">
        <Versions />
      </footer>
    </div>
  )
}

export default App
