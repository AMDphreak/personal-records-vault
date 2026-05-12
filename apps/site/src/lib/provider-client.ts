import { getOrCreatePrvVeramoAgent } from "./veramo/agent-browser";

export type ProviderExportRequest = {
  /** Base URL of a provider-hosted export endpoint (must implement CORS for browser calls). */
  exportBaseUrl: string;
  /** Subject DID appended as `subjectDid` query parameter. */
  subjectDid: string;
};

/**
 * Fetches a provider export bundle. This is a thin GET wrapper — real deployments must align on auth, signatures, and CORS.
 */
export async function fetchProviderExport(req: ProviderExportRequest): Promise<string> {
  const base =
    typeof window !== "undefined" && window.location?.href
      ? window.location.href
      : "https://local.invalid/";
  const url = new URL(req.exportBaseUrl, base);
  url.searchParams.set("subjectDid", req.subjectDid);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" }
  });
  if (!res.ok) {
    throw new Error(`Provider responded with HTTP ${res.status}`);
  }
  return await res.text();
}

export async function getActiveSubjectDid(): Promise<string> {
  const agent = await getOrCreatePrvVeramoAgent();
  const ids = await agent.didManagerFind({});
  if (!ids.length) {
    throw new Error("No DID yet — initialize identity on the Identity page first.");
  }
  return ids[0].did;
}
