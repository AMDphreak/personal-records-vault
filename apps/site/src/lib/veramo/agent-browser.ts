/**
 * Browser-only Veramo agent factory. Uses dynamic imports so SSR bundles avoid pulling crypto-heavy deps.
 */
import type { Agent } from "@veramo/core";

/** Single localStorage key used by {@link BrowserLocalStorageStore} for all JSON Veramo tables in this app. */
export const PRV_VERAMO_STORAGE_KEY = "prv-veramo-v1";

let cached: Agent | null = null;

export async function getOrCreatePrvVeramoAgent(): Promise<Agent> {
  if (typeof window === "undefined") {
    throw new Error("Veramo agent is only available in the browser");
  }
  if (cached) return cached;

  const [
    { createAgent },
    { DataStoreJson, BrowserLocalStorageStore, DIDStoreJson, KeyStoreJson, PrivateKeyStoreJson },
    { KeyManager },
    { KeyManagementSystem },
    { DIDManager },
    { KeyDIDProvider },
    { CredentialPlugin }
  ] = await Promise.all([
    import("@veramo/core"),
    import("@veramo/data-store-json"),
    import("@veramo/key-manager"),
    import("@veramo/kms-local"),
    import("@veramo/did-manager"),
    import("@veramo/did-provider-key"),
    import("@veramo/credential-w3c")
  ]);

  const jsonStore = BrowserLocalStorageStore.fromLocalStorage(PRV_VERAMO_STORAGE_KEY);
  const dataStore = new DataStoreJson(jsonStore);
  const didStore = new DIDStoreJson(jsonStore);
  const keyStore = new KeyStoreJson(jsonStore);
  const privateKeyStore = new PrivateKeyStoreJson(jsonStore);
  const kms = new KeyManagementSystem(privateKeyStore);
  const keyManager = new KeyManager({
    store: keyStore,
    kms: { local: kms }
  });
  const didManager = new DIDManager({
    store: didStore,
    defaultProvider: "did:key",
    providers: {
      "did:key": new KeyDIDProvider({ defaultKms: "local" })
    }
  });

  cached = createAgent({
    plugins: [dataStore, keyManager, didManager, new CredentialPlugin()]
  });

  return cached;
}

export function resetPrvVeramoAgentCache(): void {
  cached = null;
}

/** Removes persisted Veramo JSON from localStorage and drops the in-memory agent. */
export function clearPrvVeramoBrowserStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PRV_VERAMO_STORAGE_KEY);
  } catch {
    /* quota or private mode */
  }
  resetPrvVeramoAgentCache();
}
