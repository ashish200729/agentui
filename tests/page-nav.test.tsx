import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { PageNav } from "@/components/app/docs/page-nav";

afterEach(cleanup);

describe("PageNav", () => {
  test("keeps the right rail focused on page navigation", () => {
    const { getByRole, queryByText } = render(
      <PageNav
        items={[
          {
            id: "prompt-input",
            label: "Prompt Input",
            children: [{ id: "preview", label: "Preview" }],
          },
        ]}
      />,
    );

    expect(getByRole("complementary", { name: "On this page" })).toBeTruthy();
    expect(getByRole("link", { name: "Prompt Input" })).toBeTruthy();
    expect(getByRole("link", { name: "Preview" })).toBeTruthy();
    expect(queryByText(/AgentUI Pro/i)).toBeNull();
    expect(queryByText(/lifetime access/i)).toBeNull();
  });
});
