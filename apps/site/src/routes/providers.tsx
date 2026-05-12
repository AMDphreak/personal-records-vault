import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { onMount, Show } from "solid-js";
import { readSession } from "~/lib/session";

const ProviderPanel = clientOnly(() => import("~/components/ProviderPanel"));

export default function ProvidersRoute() {
  const navigate = useNavigate();

  onMount(() => {
    if (!readSession()) {
      navigate("/login", { replace: true });
    }
  });

  return (
    <Show when={readSession()}>
      <Title>Providers — Personal Records Vault</Title>
      <ProviderPanel />
    </Show>
  );
}
