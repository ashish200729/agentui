import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SponsorContactActions } from "@/components/app/sponsors/sponsor-contact-actions";
import { SPONSORSHIP_EMAIL } from "@/lib/sponsorship";

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");

afterEach(() => {
  cleanup();
  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard);
  } else {
    Reflect.deleteProperty(navigator, "clipboard");
  }
});

describe("sponsorship contact", () => {
  test("copies the address without requiring an email handler", async () => {
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const view = render(<SponsorContactActions />);

    expect(view.getByText(SPONSORSHIP_EMAIL)).toBeTruthy();
    expect(view.queryByRole("link", { name: "Open email app" })).toBeNull();

    fireEvent.click(view.getByRole("button", { name: "Copy address" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SPONSORSHIP_EMAIL));
    expect(view.getByRole("status").textContent).toContain("Address copied");
  });

  test("keeps the address selectable when clipboard access fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: mock(async () => { throw new Error("blocked"); }) },
    });
    const view = render(<SponsorContactActions />);

    fireEvent.click(view.getByRole("button", { name: "Copy address" }));
    await waitFor(() => expect(view.getByRole("status").textContent).toContain("Select the address"));
    expect(view.getByText(SPONSORSHIP_EMAIL)).toBeTruthy();
  });
});
