import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AdminDashboard } from "@/app/admin/admin-dashboard";

const originalFetch = globalThis.fetch;
const user = {
  id: "user-1",
  name: "A1 tech Ashish",
  email: "a1tech@example.com",
  emailVerified: true,
  image: null,
  createdAt: "2026-09-22T09:20:00.000Z",
  updatedAt: "2026-09-22T09:20:00.000Z",
  lastSignInAt: "2026-09-23T00:05:00.000Z",
  providers: ["google"],
};

function renderDashboard(replace: ReturnType<typeof mock>) {
  const router = { replace } as unknown as AppRouterInstance;
  return render(
    <AppRouterContext.Provider value={router}>
      <AdminDashboard />
    </AppRouterContext.Provider>,
  );
}

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});

describe("admin directory", () => {
  test("offers retry when the session service is unavailable", async () => {
    globalThis.fetch = mock(async () =>
      Response.json(
        { error: { code: "SERVICE_UNAVAILABLE", message: "Unavailable", requestId: "test" } },
        { status: 503 },
      ),
    ) as unknown as typeof fetch;

    const replace = mock(() => {});
    const view = renderDashboard(replace);
    await waitFor(() => expect(view.getByText("Admin service unavailable")).toBeTruthy());
    expect(view.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  test("keeps the newest provider result when an older request finishes late", async () => {
    let finishGoogle: ((response: Response) => void) | undefined;
    let googleRequested = false;
    const googleResponse = new Promise<Response>((resolve) => {
      finishGoogle = resolve;
    });
    globalThis.fetch = mock(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/admin/session")) {
        return Response.json({
          admin: { email: "admin@example.com", expiresAt: "2026-09-24T00:00:00.000Z" },
        });
      }
      if (url.searchParams.get("provider") === "google") {
        googleRequested = true;
        return googleResponse;
      }
      if (url.searchParams.get("provider") === "github") {
        return Response.json({ items: [], total: 0, nextCursor: null });
      }
      return Response.json({ items: [user], total: 1, nextCursor: null });
    }) as unknown as typeof fetch;

    const replace = mock(() => {});
    const view = renderDashboard(replace);
    await waitFor(() => expect(view.queryAllByText("A1 tech Ashish").length).toBeGreaterThan(0));

    fireEvent.click(view.getByRole("button", { name: "Google" }));
    await waitFor(() => expect(googleRequested).toBe(true));
    fireEvent.click(view.getByRole("button", { name: "GitHub" }));
    await waitFor(() => expect(view.getByText("No matching users")).toBeTruthy());

    await act(async () => {
      finishGoogle?.(Response.json({ items: [user], total: 1, nextCursor: null }));
      await googleResponse;
    });

    expect(view.queryAllByText("A1 tech Ashish")).toHaveLength(0);
    expect(view.getByRole("button", { name: "GitHub" }).getAttribute("aria-pressed")).toBe("true");
    expect(replace).not.toHaveBeenCalled();
  });

  test("shows a failed sign-out and keeps the admin on the directory", async () => {
    globalThis.fetch = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/admin/session")) {
        if (init?.method === "DELETE") {
          return Response.json(
            { error: { code: "SERVICE_UNAVAILABLE", message: "Try again.", requestId: "test" } },
            { status: 503 },
          );
        }
        return Response.json({
          admin: { email: "admin@example.com", expiresAt: "2026-09-24T00:00:00.000Z" },
        });
      }
      return Response.json({ items: [user], total: 1, nextCursor: null });
    }) as unknown as typeof fetch;

    const replace = mock(() => {});
    const view = renderDashboard(replace);
    await waitFor(() => expect(view.queryAllByText("A1 tech Ashish").length).toBeGreaterThan(0));
    expect((await axe(view.container)).violations).toEqual([]);
    fireEvent.click(view.getByRole("button", { name: "Sign out" }));

    await waitFor(() =>
      expect(view.getByRole("alert").textContent).toContain("Could not sign out"),
    );
    expect(replace).not.toHaveBeenCalled();
    expect(view.queryAllByText("A1 tech Ashish").length).toBeGreaterThan(0);
  });
});
