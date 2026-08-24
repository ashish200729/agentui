import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dir, "..");

describe("site navigation", () => {
  test("keeps guide links out of the shared desktop and mobile list", async () => {
    const [sidebar, mobileNav] = await Promise.all([
      readFile(
        path.join(ROOT, "components/app/chrome/site-sidebar.tsx"),
        "utf8",
      ),
      readFile(
        path.join(ROOT, "components/app/chrome/mobile-nav.tsx"),
        "utf8",
      ),
    ]);

    expect(sidebar).not.toContain("Agent Guide");
    expect(sidebar).not.toContain("OpenUI");
    expect(sidebar).not.toContain(">Guides<");
    expect(mobileNav).toContain("<SidebarNav");
  });

  test("keeps guide links out of the shared dock", async () => {
    const dock = await readFile(
      path.join(ROOT, "components/app/chrome/site-dock.tsx"),
      "utf8",
    );

    expect(dock).not.toContain("Agent guide");
    expect(dock).not.toContain("OpenUI guide");
    expect(dock).not.toContain("/docs/ai-agents");
    expect(dock).not.toContain("/docs/openui");
    expect(dock).toContain('aria-label="Home"');
    expect(dock).toContain('aria-label="Components"');
    expect(dock).toContain('aria-label="Toggle theme"');
  });
});
