/** Canonical site origin. Override per environment via NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agentui.pro"
).replace(/\/$/, "");

/** Public shadcn namespace owned by AgentUI. */
export const REGISTRY_NAMESPACE = "@agentui" as const;

/** Direct install target used until @agentui is accepted into shadcn's directory. */
export function registryItemUrl(slug: string) {
  return `${SITE_URL}/r/${slug}.json`;
}
