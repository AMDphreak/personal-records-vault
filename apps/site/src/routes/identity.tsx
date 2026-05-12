import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { onMount, Show } from "solid-js";
import { readSession } from "~/lib/session";

const IdentityPanel = clientOnly(() => import("~/components/IdentityPanel"));

export default function IdentityRoute() {
  const navigate = useNavigate();

  onMount(() => {
    if (!readSession()) {
      navigate("/login", { replace: true });
    }
  });

  return (
    <Show when={readSession()}>
      <Title>Identity — Personal Records Vault</Title>
      <IdentityPanel />
    </Show>
  );
}
