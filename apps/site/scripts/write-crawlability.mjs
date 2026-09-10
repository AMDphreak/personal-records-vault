import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getSiteOrigin, getSitemapRoutes } from "./site-routes.mjs";

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toLoc(origin, route) {
  if (route === "/") return `${origin}/`;
  return `${origin}${route}`;
}

/**
 * Write into apps/site/public so Vinxi copies artifacts.
 * Prefer process.cwd()/public when building with cwd=apps/site — Vinxi can
 * inline this module into a timestamped app.config and break import.meta.url.
 */
export function writeCrawlabilityToPublic() {
  const modulePublic = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
  const cwdPublic = join(process.cwd(), "public");
  const pub = modulePublic.replace(/\\/g, "/").includes("/site/public")
    ? modulePublic
    : cwdPublic;
  mkdirSync(pub, { recursive: true });
  const origin = getSiteOrigin();
  const locs = [...new Set(getSitemapRoutes().map((r) => toLoc(origin, r)))];
  const body = locs.map((loc) => `  <url><loc>${escapeXml(loc)}</loc></url>`).join("\n");
  writeFileSync(
    join(pub, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  );
  writeFileSync(
    join(pub, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
  );
}

writeCrawlabilityToPublic();
