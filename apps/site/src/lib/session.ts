const SESSION_KEY = "prv_web_session_v1";

export type WebSession = {
  email: string;
  createdAt: string;
};

export function readSession(): WebSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WebSession;
  } catch {
    return null;
  }
}

export function writeSession(session: WebSession): void {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
}
