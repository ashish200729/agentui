import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { LandingComponentCard } from "@/components/app/landing/landing-component-card";
import { publicRegistry } from "@/lib/registry";

afterEach(cleanup);

describe("LandingComponentCard", () => {
  test("keeps the preview focused and removes redundant card branding", () => {
    const message = publicRegistry[0]?.components.find(
      (component) => component.slug === "message",
    );
    expect(message).toBeDefined();
    if (!message) return;

    const { container, getByRole, queryByText } = render(
      <LandingComponentCard category="agents" component={message} />,
    );

    expect(getByRole("link", { name: "View Message" })).toBeTruthy();
    expect(getByRole("heading", { name: "Message" })).toBeTruthy();
    expect(queryByText(/live preview/i)).toBeNull();
    expect(queryByText("Agent UI")).toBeNull();
    const preview = container.querySelector('[data-slot="landing-preview"]');
    const metadata = container.querySelector(
      '[data-slot="landing-component-meta"]',
    );
    expect(preview).toBeTruthy();
    expect(preview?.parentElement?.className).toContain("flex");
    expect(
      container.querySelector('[data-slot="landing-component-handoff"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-slot="landing-component-arrow"]'),
    ).toBeTruthy();
    expect(metadata).toBeTruthy();
    expect(metadata?.className).toContain("h-16");
  });
});
