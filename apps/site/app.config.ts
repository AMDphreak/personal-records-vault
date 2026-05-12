import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@solidjs/start/config";

const noble = (file: string) =>
  path.normalize(fileURLToPath(new URL(`../../node_modules/@noble/hashes/${file}`, import.meta.url)));

// SolidStart 1 + Vinxi static preset: prerendered HTML for Netlify without a Node host.
export default defineConfig({
  server: {
    preset: "static",
    prerender: {
      crawlLinks: true,
      routes: ["/", "/download", "/login", "/app", "/identity", "/providers"]
    }
  },
  vite: {
    resolve: {
      alias: {
        // Veramo / did-jwt expect @noble/hashes v1-style subpaths; v2 moved these modules.
        "@noble/hashes/sha256": noble("sha2.js"),
        "@noble/hashes/ripemd160": noble("legacy.js")
      }
    }
  }
});
