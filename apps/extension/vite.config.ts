import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    solid(),
    {
      name: 'copy-manifest',
      closeBundle() {
        const outDir = resolve(__dirname, 'dist')
        if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
        copyFileSync(resolve(__dirname, 'manifest.json'), resolve(outDir, 'manifest.json'))
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyDirOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'popup.html'),
      output: {
        entryFileNames: 'popup.js',
        assetFileNames: 'popup[extname]'
      }
    }
  }
})
