import { createRequire } from "node:module";
import { defineConfig } from "@solidjs/start/config";

const require = createRequire(import.meta.url);

// Veramo / did-jwt use @noble/hashes v1-style subpaths; v2 only exports ./sha2.js, ./legacy.js, etc.
// Resolve real paths so pnpm + Linux (Netlify) do not depend on a fragile ../../node_modules walk.
const nobleHashesAliases = {
  "@noble/hashes/sha256": require.resolve("@noble/hashes/sha2.js"),
  "@noble/hashes/ripemd160": require.resolve("@noble/hashes/legacy.js")
} as const;

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
        ...nobleHashesAliases
      }
    }
  }
});
