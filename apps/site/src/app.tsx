import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { clientOnly } from "@solidjs/start";
import { Suspense } from "solid-js";
import SiteChrome from "~/components/SiteChrome";
import "./app.css";

const ClientPrivacyBootstrap = clientOnly(() => import("~/components/ClientPrivacyBootstrap"));

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Personal Records Vault</Title>
          <SiteChrome>
            <ClientPrivacyBootstrap />
            <Suspense>{props.children}</Suspense>
          </SiteChrome>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
