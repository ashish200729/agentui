/** Canonical site origin. Override per environment via NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agentui.pro"
).replace(/\/$/, "");

/** Public GA4 measurement ID. Override when deploying another AgentUI environment. */
export const GOOGLE_ANALYTICS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "G-YZPR6MCDF0";

/** Public shadcn namespace owned by AgentUI. */
export const REGISTRY_NAMESPACE = "@agentui" as const;

/** Direct install target used until @agentui is accepted into shadcn's directory. */
export function registryItemUrl(slug: string) {
  return `${SITE_URL}/r/${slug}.json`;
}
