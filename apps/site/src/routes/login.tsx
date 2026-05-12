import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { Button } from "@kobalte/core/button";
import { createSignal } from "solid-js";
import { writeSession } from "~/lib/session";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = createSignal<string | null>(null);

  const onSubmit = (ev: SubmitEvent) => {
    ev.preventDefault();
    setError(null);
    const form = ev.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    if (!email || !password) {
      setError("Enter an email and passphrase to continue.");
      return;
    }
    writeSession({ email, createdAt: new Date().toISOString() });
    navigate("/app", { replace: true });
  };

  return (
    <section class="form">
      <Title>Web sign-in — Personal Records Vault</Title>
      <h1>Web sign-in</h1>
      <p>
        This is a <strong>local session marker</strong> only (stored in <code>sessionStorage</code>). It is not a cloud
        account and does not send credentials anywhere. Replace with your real auth provider when you wire hosted
        services.
      </p>

      <form onSubmit={onSubmit}>
        <div class="form__field">
          <label class="label" for="email">
            Email or username
          </label>
          <input class="input" id="email" name="email" type="text" autocomplete="username" />
        </div>
        <div class="form__field">
          <label class="label" for="password">
            Passphrase
          </label>
          <input class="input" id="password" name="password" type="password" autocomplete="current-password" />
        </div>
        {error() ? <p style={{ color: "#b42318" }}>{error()}</p> : null}
        <div class="form__actions">
          <Button type="submit">Continue to web vault</Button>
        </div>
      </form>
    </section>
  );
}
