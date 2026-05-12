import { Title } from "@solidjs/meta";

export default function Home() {
  return (
    <section class="hero">
      <Title>Personal Records Vault</Title>
      <h1>Own your records. Share with intent.</h1>
      <p>
        Download the desktop vault, use the browser companion for quick access, and open your on-disk vault from this
        static site when your browser supports local folder access.
      </p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="/download">
          Get downloads
        </a>
        <a class="btn" href="/login">
          Web sign-in
        </a>
      </div>

      <div class="panel">
        <h2>How the web vault works</h2>
        <p>
          After a lightweight sign-in (stored only in <code>sessionStorage</code> on your device), you can point the app
          at a folder on disk—typically a USB copy of your vault. Nothing is uploaded to Netlify; processing happens in
          your browser tab.
        </p>
      </div>
    </section>
  );
}
