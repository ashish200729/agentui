import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import CategoryPage from "@/app/components/[category]/page";
import {
  AGENT_CATALOG_LABELS,
  AgentCatalogCard,
} from "@/components/app/docs/agent-catalog-card";
import { AgentCatalogHero } from "@/components/app/docs/agent-catalog-hero";
import { publicRegistry } from "@/lib/registry";

afterEach(cleanup);

describe("agent component catalogue", () => {
  test("keeps the hero quiet and focused on discovery", () => {
    const { getByRole, queryByText } = render(
      <AgentCatalogHero componentCount={17} />,
    );

    expect(
      getByRole("heading", { name: "Components for the full agent loop." }),
    ).toBeTruthy();
    expect(getByRole("link", { name: "Browse all 17" })).toBeTruthy();
    expect(getByRole("link", { name: "Browse all 17" }).getAttribute("href")).toBe(
      "#all-components",
    );
    expect(queryByText("Agent run")).toBeNull();
    expect(queryByText("Ready for review")).toBeNull();
  });

  test("uses a compact preview-only card with a functional label", () => {
    const chatApp = publicRegistry[0]?.components.find(
      (component) => component.slug === "chat-app",
    );
    expect(chatApp).toBeDefined();
    if (!chatApp) return;

    const { container, getByRole, queryByText } = render(
      <AgentCatalogCard component={chatApp} />,
    );

    const card = getByRole("link", { name: "Chat App: Agent workspace" });
    expect(card.getAttribute("href")).toBe("/components/agents/chat-app");
    const cardFrame = container.querySelector('[data-slot="agent-catalog-card"]');
    expect(cardFrame?.className).toContain("aspect-square");
    expect(
      container.querySelector('[data-slot="agent-catalog-preview"]'),
    ).toBeTruthy();
    expect(getByRole("heading", { name: "Chat App" })).toBeTruthy();
    expect(queryByText(chatApp.description)).toBeNull();
    expect(queryByText("Agent workspace")).toBeTruthy();
    expect(queryByText(/chat-app\.json/i)).toBeNull();
    expect(container.querySelector('[data-slot="landing-preview"]')).toBeNull();
  });

  test("defines a concise label for every public agent component", () => {
    const components = publicRegistry[0]?.components ?? [];
    expect(components.length).toBeGreaterThan(0);

    for (const component of components) {
      const label = AGENT_CATALOG_LABELS[component.slug];
      expect(label).toBeDefined();
      expect(label?.length).toBeLessThanOrEqual(24);
    }
  });

  test("shows every component in one grid without category sections", async () => {
    const page = await CategoryPage({
      params: Promise.resolve({ category: "agents" }),
    });
    const { container, getByRole, queryByRole } = render(page);

    expect(
      getByRole("heading", { name: "All agent components" }),
    ).toBeTruthy();
    expect(
      container.querySelectorAll('[data-slot="agent-catalog-card"]').length,
    ).toBe(publicRegistry[0]?.components.length ?? 0);
    expect(
      queryByRole("heading", { name: "Workspace and navigation" }),
    ).toBeNull();
    expect(queryByRole("heading", { name: "Conversation" })).toBeNull();
  });

  test("has no automated accessibility violations", async () => {
    const message = publicRegistry[0]?.components.find(
      (component) => component.slug === "message",
    );
    expect(message).toBeDefined();
    if (!message) return;

    const { container } = render(
      <main>
        <AgentCatalogHero componentCount={17} />
        <h2>All agent components</h2>
        <AgentCatalogCard component={message} />
      </main>,
    );

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
