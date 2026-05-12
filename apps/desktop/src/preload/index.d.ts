import { ElectronAPI } from '@electron-toolkit/preload'

export type VaultPreloadApi = {
  pickVaultLocation: () => Promise<string | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: VaultPreloadApi
  }
}

export {}
