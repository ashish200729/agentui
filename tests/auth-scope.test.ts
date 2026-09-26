import { describe, expect, test } from "bun:test";

const read = (path: string) => Bun.file(path).text();

describe("authentication scope", () => {
  test("keeps registry and raw source routes anonymous", async () => {
    const routes = await Promise.all([
      read("app/r/[slug]/route.ts"),
      read("app/r/[slug]/raw/route.ts"),
      read("app/r/registry.json/route.ts"),
    ]);
    for (const route of routes) {
      expect(route).not.toContain("authClient");
      expect(route).not.toContain("getSession");
      expect(route).not.toContain("UNAUTHENTICATED");
    }
  });

  test("gates component copy controls without gating unrelated copy actions", async () => {
    const [componentPage, installCommand, sponsorPage, playgroundPanel] = await Promise.all([
      read("app/components/[category]/[slug]/page.tsx"),
      read("components/app/docs/install-command.tsx"),
      read("app/sponsors/page.tsx"),
      read("components/app/playground/code-panel.tsx"),
    ]);

    expect(componentPage).toContain("requiresAuth");
    expect(installCommand).toContain("requiresAuth");
    expect(sponsorPage).not.toContain("requiresAuth");
    expect(playgroundPanel).not.toContain("requiresAuth");
  });
});
