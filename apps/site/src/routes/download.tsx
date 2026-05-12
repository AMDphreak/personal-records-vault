import { Title } from "@solidjs/meta";

const REPO = "https://github.com/AMDphreak/personal-records-vault";

export default function Download() {
  return (
    <section class="hero">
      <Title>Downloads — Personal Records Vault</Title>
      <h1>Get the apps</h1>
      <p>
        Installers are produced from GitHub Actions release artifacts. Until the first tagged release ships, build from
        source with <code>pnpm dist</code> in the desktop package.
      </p>

      <div class="download-grid">
        <div class="card">
          <h2>Desktop</h2>
          <p>Windows, macOS, and Linux installers via Electron.</p>
          <a class="btn btn--primary" href={`${REPO}/releases`} target="_blank" rel="noreferrer">
            GitHub Releases
          </a>
        </div>
        <div class="card">
          <h2>Browser companion</h2>
          <p>Chrome, Edge, and Firefox (MV3) extension build instructions live in the repository README.</p>
          <a class="btn" href={`${REPO}/tree/main/apps/extension`} target="_blank" rel="noreferrer">
            Extension sources
          </a>
        </div>
        <div class="card">
          <h2>Source</h2>
          <p>Clone the monorepo for desktop, extension, SDK, and this site.</p>
          <a class="btn" href={REPO} target="_blank" rel="noreferrer">
            View repository
          </a>
        </div>
      </div>
    </section>
  );
}
