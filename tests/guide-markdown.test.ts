import { describe, expect, test } from "bun:test";
import {
  GET,
  generateStaticParams,
} from "@/app/docs/[slug]/route";
import { buildGuideMarkdown, GUIDE_SLUGS } from "@/lib/guide-markdown";

describe("guide Markdown", () => {
  test("builds every published guide with canonical frontmatter", () => {
    expect([...GUIDE_SLUGS]).toEqual(["motion-patterns"]);

    for (const slug of GUIDE_SLUGS) {
      const markdown = buildGuideMarkdown(slug);
      expect(markdown).toContain(`documentation: "https://www.agentui.pro/docs/${slug}"`);
      expect(markdown).toContain(`markdown: "https://www.agentui.pro/docs/${slug}.md"`);
      expect(markdown).toContain("\n## ");
    }
  });

  test("publishes static .md params", () => {
    expect(generateStaticParams()).toEqual(
      GUIDE_SLUGS.map((slug) => ({ slug: `${slug}.md` })),
    );
  });

  test("serves Markdown with discovery headers", async () => {
    const response = await GET(new Request("https://www.agentui.pro/docs/motion-patterns.md"), {
      params: Promise.resolve({ slug: "motion-patterns.md" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("x-robots-tag")).toBe("noindex");
    expect(response.headers.get("link")).toContain("</docs/motion-patterns>");
    expect(await response.text()).toContain("# Motion Guides");
  });

  test("returns not found for the removed guides", async () => {
    const [agentGuide, openui] = await Promise.all([
      GET(new Request("https://www.agentui.pro/docs/ai-agents.md"), {
        params: Promise.resolve({ slug: "ai-agents.md" }),
      }),
      GET(new Request("https://www.agentui.pro/docs/openui.md"), {
        params: Promise.resolve({ slug: "openui.md" }),
      }),
    ]);

    expect(agentGuide.status).toBe(404);
    expect(openui.status).toBe(404);
  });

  test("rejects unknown or non-Markdown guide paths", async () => {
    const unknown = await GET(new Request("https://www.agentui.pro/docs/unknown.md"), {
      params: Promise.resolve({ slug: "unknown.md" }),
    });
    const html = await GET(new Request("https://www.agentui.pro/docs/openui"), {
      params: Promise.resolve({ slug: "openui" }),
    });

    expect(unknown.status).toBe(404);
    expect(html.status).toBe(404);
  });
});
