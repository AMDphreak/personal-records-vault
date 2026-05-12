/**
 * Options for {@link createVaultClient}.
 */
export type VaultClientOptions = {
  /** Base URL including `/v0` suffix, e.g. `http://127.0.0.1:17430/v0`. */
  baseUrl: string
  /** Optional fetch implementation (Node 18+ global fetch is used by default). */
  fetchFn?: typeof fetch
}

export type HealthResponse = {
  ok: boolean
  apiVersion: string
  productVersion?: string | null
}

export type GraphNodeRef = {
  id: string
  kind: string
  label: string
}

export type GraphEdgeRef = {
  fromId: string
  toId: string
  kind: string
}

export type GraphSummary = {
  nodes: GraphNodeRef[]
  edges: GraphEdgeRef[]
}

export type PartyRef = {
  displayName: string
  did?: string
  software?: string
}

export type ExchangeEntry = {
  entryId: string
  resourceType: string
  payload: Record<string, unknown> | string
}

export type ExchangeBundle = {
  bundleId: string
  issuedAt: string
  issuer: PartyRef
  entries: ExchangeEntry[]
  profile?: string
}

export type ImportReceipt = {
  jobId: string
  status: 'accepted' | 'duplicate' | 'rejected'
  detail?: string | null
}

export type VaultClient = {
  health(): Promise<HealthResponse>
  getGraphSummary(): Promise<GraphSummary>
  importExchangeBundle(body: ExchangeBundle): Promise<ImportReceipt>
}

function joinUrl(base: string, path: string): string {
  const trimmed = base.replace(/\/+$/, '')
  return `${trimmed}${path.startsWith('/') ? path : `/${path}`}`
}

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  return (await res.json()) as T
}

/**
 * Creates a minimal HTTP client for the Local Provider API described in
 * `spec/openapi/prv-local.openapi.yaml`.
 */
export function createVaultClient(options: VaultClientOptions): VaultClient {
  const fetchImpl = options.fetchFn ?? fetch

  return {
    async health() {
      const res = await fetchImpl(joinUrl(options.baseUrl, '/health'), { method: 'GET' })
      return readJson<HealthResponse>(res)
    },

    async getGraphSummary() {
      const res = await fetchImpl(joinUrl(options.baseUrl, '/graph/summary'), { method: 'GET' })
      return readJson<GraphSummary>(res)
    },

    async importExchangeBundle(body: ExchangeBundle) {
      const res = await fetchImpl(joinUrl(options.baseUrl, '/exchange/import'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      })
      return readJson<ImportReceipt>(res)
    }
  }
}
