import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AdminSignIn } from "@/app/admin/sign-in/sign-in";

const originalFetch = globalThis.fetch;

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});

describe("admin sign in", () => {
  test("submits the controlled fields and opens the directory", async () => {
    const submitted: Array<{ email: string; password: string }> = [];
    globalThis.fetch = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "POST") {
        submitted.push(JSON.parse(String(init.body)));
        return Response.json({
          admin: { email: "admin@example.com", expiresAt: "2026-09-24T00:00:00.000Z" },
        });
      }
      return Response.json(
        { error: { code: "UNAUTHENTICATED", message: "Sign in", requestId: "test" } },
        { status: 401 },
      );
    }) as unknown as typeof fetch;

    const replace = mock(() => {});
    const router = { replace } as unknown as AppRouterInstance;
    const view = render(
      <AppRouterContext.Provider value={router}>
        <AdminSignIn />
      </AppRouterContext.Provider>,
    );

    expect((await axe(view.container)).violations).toEqual([]);
    fireEvent.change(view.getByRole("textbox", { name: "Email" }), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(view.getByLabelText("Password"), {
      target: { value: "temporary-test-password-123" },
    });
    fireEvent.click(view.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin"));
    expect(submitted).toEqual([
      { email: "admin@example.com", password: "temporary-test-password-123" },
    ]);
  });
});
