import { clearEphemeral } from "./ephemeral-provider";
import { resetPrvVeramoAgentCache } from "./veramo/agent-browser";

type Listener = () => void;
const listeners = new Set<Listener>();

let blind = false;
let vaultHandle: FileSystemDirectoryHandle | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

function emit() {
  for (const l of listeners) l();
}

export function subscribePrivacy(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isBlind(): boolean {
  return blind;
}

export function setBlind(next: boolean) {
  blind = next;
  if (next) {
    clearEphemeral();
  }
  emit();
}

export function getVaultHandle(): FileSystemDirectoryHandle | null {
  return vaultHandle;
}

export function attachVaultDirectory(handle: FileSystemDirectoryHandle | null) {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (!handle) {
    vaultHandle = null;
    expungeSensitiveState("vault detached");
    return;
  }
  vaultHandle = handle;
  setBlind(false);
  void refreshVaultTrust();
  pollTimer = setInterval(() => {
    void refreshVaultTrust();
  }, 4000);
}

async function refreshVaultTrust() {
  if (!vaultHandle) {
    setBlind(true);
    return;
  }
  try {
    const status = await vaultHandle.queryPermission({ mode: "readwrite" });
    if (status !== "granted") {
      expungeSensitiveState("vault permission lost");
    }
  } catch {
    expungeSensitiveState("vault permission error");
  }
}

export function expungeSensitiveState(reason?: string) {
  void reason;
  vaultHandle = null;
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  clearEphemeral();
  resetPrvVeramoAgentCache();
  setBlind(true);
}

export function isStrictPublicSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem("prv_strict_public") === "1";
}

export function setStrictPublicSession(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (enabled) window.sessionStorage.setItem("prv_strict_public", "1");
  else window.sessionStorage.removeItem("prv_strict_public");
}

export function redactLabel(value: string | undefined | null): string {
  if (!value) return "—";
  if (!isBlind()) return value;
  return "withheld";
}

export function installLifecycleGuards() {
  if (typeof window === "undefined") return () => {};
  const onHide = () => {
    if (document.visibilityState === "hidden" && isStrictPublicSession()) {
      expungeSensitiveState("visibility hidden (strict public session)");
    }
  };
  const onPageHide = () => {
    clearEphemeral();
  };
  const onBeforeUnload = () => {
    clearEphemeral();
  };
  window.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("beforeunload", onBeforeUnload);
  return () => {
    window.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("beforeunload", onBeforeUnload);
  };
}

/**
 * Best-effort: user picks a BLE device; when GATT disconnects we treat it like hardware removal.
 * Requires a secure context, user gesture, and a cooperative device; many security keys do not use Web Bluetooth.
 */
export async function watchBluetoothDisconnect(onDisconnect: () => void): Promise<() => void> {
  if (typeof navigator === "undefined" || !("bluetooth" in navigator) || !navigator.bluetooth) {
    throw new Error("Web Bluetooth is not available in this browser or context (HTTPS required).");
  }
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: []
  });
  const gatt = device.gatt;
  if (gatt) {
    await gatt.connect();
  }
  const handler = () => {
    onDisconnect();
  };
  device.addEventListener("gattserverdisconnected", handler);
  return () => {
    device.removeEventListener("gattserverdisconnected", handler);
    try {
      gatt?.disconnect();
    } catch {
      /* ignore */
    }
  };
}
