import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { onMount, Show } from "solid-js";
import { readSession } from "~/lib/session";

const VaultPanel = clientOnly(() => import("~/components/VaultPanel"));

export default function AppRoute() {
  const navigate = useNavigate();

  onMount(() => {
    if (!readSession()) {
      navigate("/login", { replace: true });
    }
  });

  return (
    <Show when={readSession()}>
      <Title>Web vault — Personal Records Vault</Title>
      <VaultPanel />
    </Show>
  );
}
