import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dir, "..");
const PUBLIC_SURFACES = [
  "app/api/og/route.tsx",
  "app/llms.txt/route.ts",
  "app/sitemap.ts",
  "components/app/chrome/site-dock.tsx",
  "components/app/chrome/site-footer.tsx",
  "components/app/chrome/site-search.tsx",
  "components/app/chrome/site-sidebar.tsx",
  "components/app/landing/work-cta.tsx",
  "components/previews/agents/chat-app-usage.tsx",
  "lib/guide-markdown.ts",
] as const;

const REMOVED_REFERENCES = [
  "/docs/ai-agents",
  "/docs/openui",
  "Agent Guide",
  "Agent guide",
  "OpenUI",
] as const;

describe("removed website guides", () => {
  test("deletes both page routes", () => {
    expect(existsSync(path.join(ROOT, "app/docs/ai-agents/page.tsx"))).toBe(false);
    expect(existsSync(path.join(ROOT, "app/docs/openui/page.tsx"))).toBe(false);
  });

  test("keeps guide references out of public discovery surfaces", async () => {
    const offenders: string[] = [];

    for (const file of PUBLIC_SURFACES) {
      const source = await readFile(path.join(ROOT, file), "utf8");
      if (REMOVED_REFERENCES.some((reference) => source.includes(reference))) {
        offenders.push(file);
      }
    }

    expect(offenders).toEqual([]);
  });
});
