import { defineConfig } from "@solidjs/start/config";

// SolidStart 1 + Vinxi static preset: prerendered HTML for Netlify without a Node host.
export default defineConfig({
  server: {
    preset: "static",
    prerender: {
      crawlLinks: true,
      routes: ["/", "/download", "/login", "/app"]
    }
  }
});
