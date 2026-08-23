import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { buildComponentMarkdown } from "@/lib/component-markdown";
import { buildIndex, buildShadcnRegistry } from "@/lib/registry-server";
import {
  REGISTRY_NAMESPACE,
  registryItemUrl,
  SITE_URL,
} from "@/lib/site";

const ROOT = path.join(import.meta.dir, "..");
const TEXT_EXTENSIONS = new Set([".md", ".ts", ".tsx", ".json", ".jsonc"]);
const LEGACY_DOMAIN = ["agentui", "dev"].join(".");
const LEGACY_NAMESPACE = ["@", "beui"].join("");
const LEGACY_TOKEN = ["BEUI", "PRO", "TOKEN"].join("_");

async function collectTextFiles(relativePath: string): Promise<string[]> {
  const absolutePath = path.join(ROOT, relativePath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTextFiles(child)));
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(child);
    }
  }

  return files;
}

describe("AgentUI production registry branding", () => {
  test("uses the owned canonical domain and namespace", () => {
    expect(SITE_URL).toBe("https://www.agentui.pro");
    expect(REGISTRY_NAMESPACE).toBe("@agentui");
    expect(registryItemUrl("prompt-input")).toBe(
      "https://www.agentui.pro/r/prompt-input.json",
    );
  });

  test("generates canonical registry metadata and direct install commands", async () => {
    const [registry, index, markdown] = await Promise.all([
      buildShadcnRegistry(),
      buildIndex(),
      buildComponentMarkdown("agents", "prompt-input"),
    ]);

    expect(registry.homepage).toBe(SITE_URL);
    expect(index.site).toBe(SITE_URL);
    expect(Object.values(index.endpoints).every((url) => url.startsWith(SITE_URL))).toBe(true);
    expect(markdown).toContain(
      "npx shadcn@latest add https://www.agentui.pro/r/prompt-input.json",
    );
  });

  test("does not ship legacy domains, namespaces, or token names", async () => {
    const files = [
      "README.md",
      "AGENTS.md",
      ...(await collectTextFiles("app")),
      ...(await collectTextFiles("components")),
      ...(await collectTextFiles("lib")),
      ...(await collectTextFiles("mcp")),
      ...(await collectTextFiles("skills")),
    ];

    const offenders: string[] = [];
    for (const file of files) {
      const content = await readFile(path.join(ROOT, file), "utf8");
      if (
        content.includes(LEGACY_DOMAIN) ||
        content.includes(LEGACY_NAMESPACE) ||
        content.includes(LEGACY_TOKEN)
      ) {
        offenders.push(file);
      }
    }

    expect(offenders).toEqual([]);
  });
});
