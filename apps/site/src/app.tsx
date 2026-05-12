import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import SiteChrome from "~/components/SiteChrome";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Personal Records Vault</Title>
          <SiteChrome>
            <Suspense>{props.children}</Suspense>
          </SiteChrome>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
