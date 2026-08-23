import { describe, expect, test } from "bun:test";
import { getPreview, previews } from "@/components/previews";
import { publicRegistry } from "@/lib/registry";

describe("landing previews", () => {
  test("every published component resolves a visible preview", () => {
    for (const category of publicRegistry) {
      for (const component of category.components) {
        const preview = getPreview(
          category.slug,
          component.slug,
          component.examples?.map((example) => example.previewKey),
        );
        expect(preview, `${category.slug}/${component.slug}`).toBeDefined();
      }
    }
  });

  test("uses a stable Agent Activity composition on the landing page", () => {
    expect(getPreview("agents", "agent-activity")).toBe(
      previews["agents/agent-activity"],
    );
  });
});
