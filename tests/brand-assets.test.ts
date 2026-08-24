import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dir, "..");

describe("AgentUI brand assets", () => {
  test("ships a deterministic adaptive SVG mark", async () => {
    const svg = await readFile(
      path.join(ROOT, "public/agentui-mark.svg"),
      "utf8",
    );

    expect(svg).toContain('viewBox="0 0 1024 1024"');
    expect(svg).toContain("prefers-color-scheme: dark");
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).toContain('fill="currentColor"');
    expect(svg).not.toContain("gradient");
    expect(svg).not.toContain("filter");
  });

  test("ships a transparent 1024px PNG fallback", async () => {
    const png = await readFile(path.join(ROOT, "public/agentui-mark.png"));

    expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(1024);
    expect(png.readUInt32BE(20)).toBe(1024);
    expect(png[25]).toBe(6);
  });

  test("uses theme-controlled PNG in UI and adaptive SVG for favicons", async () => {
    const [header, footer, layout, manifest, og] = await Promise.all([
      readFile(path.join(ROOT, "components/app/chrome/site-header.tsx"), "utf8"),
      readFile(path.join(ROOT, "components/app/chrome/site-footer.tsx"), "utf8"),
      readFile(path.join(ROOT, "app/layout.tsx"), "utf8"),
      readFile(path.join(ROOT, "app/manifest.ts"), "utf8"),
      readFile(path.join(ROOT, "lib/og.tsx"), "utf8"),
    ]);

    expect(header).toContain("/agentui-mark.png");
    expect(header).toContain("dark:invert");
    expect(footer).toContain("/agentui-mark.png");
    expect(footer).toContain("dark:invert");
    expect(layout).toContain("/agentui-mark.svg");
    expect(manifest).toContain("/agentui-mark.svg");
    expect(manifest).toContain("/agentui-mark.png");
    expect(og).toContain("/agentui-mark.png");
  });
});
