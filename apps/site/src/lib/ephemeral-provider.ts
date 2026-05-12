export type EphemeralBlob = {
  id: string;
  label: string;
  /** Raw JSON text from a provider export (kept in RAM only). */
  body: string;
  createdAt: number;
};

const blobs = new Map<string, EphemeralBlob>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

const DEFAULT_TTL_MS = 45_000;

function scheduleExpiry(id: string, ttlMs: number) {
  const existing = timers.get(id);
  if (existing) clearTimeout(existing);
  const t = setTimeout(() => {
    blobs.delete(id);
    timers.delete(id);
    notify();
  }, ttlMs);
  timers.set(id, t);
}

const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function subscribeEphemeral(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushEphemeral(label: string, body: string, ttlMs = DEFAULT_TTL_MS): string {
  const id = crypto.randomUUID();
  blobs.set(id, { id, label, body, createdAt: Date.now() });
  scheduleExpiry(id, ttlMs);
  notify();
  return id;
}

export function listEphemeral(): EphemeralBlob[] {
  return [...blobs.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function getEphemeral(id: string): EphemeralBlob | undefined {
  return blobs.get(id);
}

export function clearEphemeral(): void {
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
  blobs.clear();
  notify();
}
