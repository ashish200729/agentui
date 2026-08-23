import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { MovingGradientButton } from "@/components/app/moving-gradient-button";

afterEach(cleanup);

describe("MovingGradientButton", () => {
  test("keeps the hero CTA semantic and theme-token driven", () => {
    const { getByRole } = render(
      <MovingGradientButton href="/components/agents">
        Explore components
      </MovingGradientButton>,
    );

    const link = getByRole("link", { name: "Explore components" });
    expect(link.getAttribute("href")).toBe("/components/agents");
    expect(link.className).toContain("text-background");
    expect(link.querySelectorAll('[aria-hidden="true"]').length).toBe(2);
  });
});
