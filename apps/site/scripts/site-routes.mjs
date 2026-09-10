/**
 * Canonical routes for Personal Records Vault marketing site.
 * Sitemap excludes auth/app surfaces: /login /app /identity.
 */
export function getPrerenderRoutes() {
  return ["/", "/download", "/login", "/app", "/identity", "/providers"];
}

export function getSitemapRoutes() {
  return ["/", "/download", "/providers"];
}

/** Prefer Netlify deploy URL when building on Netlify. */
export function getSiteOrigin() {
  const fromEnv = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.SITE_ORIGIN;
  if (fromEnv && /^https:\/\//i.test(fromEnv)) return fromEnv.replace(/\/$/, "");
  return "https://personal-records-vault.netlify.app";
}
