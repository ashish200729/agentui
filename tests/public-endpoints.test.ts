import { describe, expect, test } from "bun:test";
import { GET as getDirectoryItem } from "@/app/[slug]/route";
import { GET as getRegistryItem } from "@/app/r/[slug]/route";
import { GET as getRawSource } from "@/app/r/[slug]/raw/route";
import { GET as getDirectoryRegistry } from "@/app/registry.json/route";
import { GET as getPublicRegistry } from "@/app/r/registry.json/route";

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("public AgentUI endpoints", () => {
  test("hide non-agent directory, detail, and raw source slugs", async () => {
    const [directory, detail, raw] = await Promise.all([
      getDirectoryItem(new Request("https://www.agentui.pro/text-scramble.json"), params("text-scramble.json")),
      getRegistryItem(new Request("https://www.agentui.pro/r/text-scramble"), params("text-scramble")),
      getRawSource(new Request("https://www.agentui.pro/r/text-scramble/raw"), params("text-scramble")),
    ]);

    expect(directory.status).toBe(404);
    expect(detail.status).toBe(404);
    expect(raw.status).toBe(404);
  });

  test("exposes only the agents category in both registry documents", async () => {
    const [directoryResponse, publicResponse] = await Promise.all([
      getDirectoryRegistry(),
      getPublicRegistry(),
    ]);
    const directory = (await directoryResponse.json()) as {
      items: Array<{ name: string }>;
    };
    const publicRegistry = (await publicResponse.json()) as {
      items: Array<{ name: string }>;
    };

    expect(directory.items.length).toBeGreaterThan(10);
    expect(publicRegistry.items).toEqual(directory.items);
    expect(directory.items.some((item) => item.name === "text-scramble")).toBe(false);
  });
});
