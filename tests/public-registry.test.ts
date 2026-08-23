import { describe, expect, test } from "bun:test";
import {
  allRegistryTargets,
  allShadcnTargets,
  buildEntry,
  buildIndex,
  buildShadcnItem,
  buildShadcnRegistry,
  findCategoryBySlug,
} from "@/lib/registry-server";
import { publicRegistry } from "@/lib/registry";

describe("public AgentUI registry", () => {
  test("publishes agent components only while retaining hidden source metadata", async () => {
    expect(publicRegistry.map((category) => category.slug)).toEqual(["agents"]);
    expect(allRegistryTargets().every((target) => target.categorySlug === "agents")).toBe(true);
    expect(allShadcnTargets().every((target) => target.categorySlug === "agents")).toBe(true);

    const hiddenTargets = allRegistryTargets({ publicOnly: false }).filter(
      (target) => target.categorySlug !== "agents",
    );
    expect(hiddenTargets.length).toBeGreaterThan(0);
  });

  test("keeps hidden motion and block slugs out of every public registry shape", async () => {
    const [index, shadcn] = await Promise.all([
      buildIndex(),
      buildShadcnRegistry(),
    ]);

    expect(index.categories.map((category) => category.slug)).toEqual(["agents"]);
    expect(index.components.every((component) => component.category === "agents")).toBe(true);
    expect(shadcn.items.length).toBeGreaterThan(10);
    expect(shadcn.items.some((item) => item.name === "text-scramble")).toBe(false);
  });

  test("returns not found for hidden component endpoint lookups", async () => {
    expect(findCategoryBySlug("text-scramble")).toBeUndefined();
    expect(await buildEntry("motion", "text-scramble")).toBeNull();
    expect(await buildShadcnItem("motion", "text-scramble")).toBeNull();
  });
});
