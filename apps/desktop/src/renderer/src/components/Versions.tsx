import { type Component, createSignal } from 'solid-js'

const Versions: Component = () => {
  const [versions] = createSignal(window.electron.process.versions)

  return (
    <div class="row" style={{ gap: '0.75rem', 'flex-wrap': 'wrap' }}>
      <span class="pill">Electron {versions().electron}</span>
      <span class="pill">Chromium {versions().chrome}</span>
      <span class="pill">Node {versions().node}</span>
    </div>
  )
}

export default Versions
