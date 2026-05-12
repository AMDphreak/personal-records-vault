import { render } from 'solid-js/web'
import { type Component } from 'solid-js'

const Popup: Component = () => {
  return (
    <main style={{ width: '320px', padding: '12px', 'font-family': 'system-ui, sans-serif' }}>
      <h1 style={{ 'font-size': '14px', margin: '0 0 8px' }}>PRV Companion</h1>
      <p style={{ margin: 0, 'font-size': '12px', color: '#333' }}>
        Extension scaffold. Later: native messaging to the desktop app, autofill helpers, and credential hints.
      </p>
    </main>
  )
}

const root = document.getElementById('root')
if (root) {
  render(() => <Popup />, root)
}
