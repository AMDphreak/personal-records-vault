import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  pickVaultLocation: (): Promise<string | null> => ipcRenderer.invoke('vault:pick-location')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error legacy attach
  window.electron = electronAPI
  // @ts-expect-error legacy attach
  window.api = api
}
