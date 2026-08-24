import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dir, "..");

describe("public repository surface", () => {
  test("removes stale and private-only launch artifacts", () => {
    for (const relativePath of [
      "assets/logo.svg",
      "public/demo.gif",
      "mcp",
      "skills/agentui-pro",
    ]) {
      expect(existsSync(path.join(ROOT, relativePath))).toBe(false);
    }
  });

  test("keeps the original MIT notice and transparent attribution", async () => {
    const [license, readme] = await Promise.all([
      readFile(path.join(ROOT, "LICENSE"), "utf8"),
      readFile(path.join(ROOT, "README.md"), "utf8"),
    ]);

    expect(license).toContain("Copyright (c) 2026 Saurabh Chauhan");
    expect(license).toContain(
      "The above copyright notice and this permission notice shall be included",
    );
    expect(readme).toContain("## Attribution");
    expect(readme).toContain("original copyright and permission notice");
    expect(readme).not.toContain("demo.gif");
    expect(readme).not.toContain("beUI");
  });
});
