import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/components/app/auth/auth-provider";
import { AuthControl } from "@/components/app/auth/auth-control";
import { CopyButton } from "@/components/app/docs/copy-button";
import { CopyPage } from "@/components/app/docs/copy-page";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = mock(async () => Response.json({ user: null })) as unknown as typeof fetch;
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});

function renderCopyButton(copyAuthRequired: boolean) {
  return render(
    <AuthProvider copyAuthRequired={copyAuthRequired}>
      <CopyButton text="component source" requiresAuth />
    </AuthProvider>,
  );
}

function AuthProbe() {
  const { status, refreshSession } = useAuth();
  return (
    <>
      <output data-testid="auth-status">{status}</output>
      <button type="button" onClick={() => void refreshSession()}>Refresh session</button>
    </>
  );
}

describe("component copy authentication gate", () => {
  test("ignores an older session response after a newer refresh succeeds", async () => {
    let resolveOld: ((response: Response) => void) | undefined;
    const oldResponse = new Promise<Response>((resolve) => { resolveOld = resolve; });
    let requests = 0;
    globalThis.fetch = mock(async () => {
      requests += 1;
      if (requests === 1) return Response.json({ user: null });
      if (requests === 2) return oldResponse;
      return Response.json({
        user: {
          id: "user-1",
          name: "AgentUI user",
          email: "user@example.com",
          emailVerified: true,
          image: null,
          lastSignInAt: null,
          providers: ["google"],
        },
      });
    }) as unknown as typeof fetch;
    const view = render(
      <AuthProvider copyAuthRequired>
        <AuthProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(view.getByTestId("auth-status").textContent).toBe("signed-out"));

    fireEvent.click(view.getByRole("button", { name: "Refresh session" }));
    fireEvent.click(view.getByRole("button", { name: "Refresh session" }));
    await waitFor(() => expect(view.getByTestId("auth-status").textContent).toBe("authenticated"));
    await act(async () => {
      resolveOld?.(Response.json({ user: null }));
      await oldResponse;
    });
    expect(view.getByTestId("auth-status").textContent).toBe("authenticated");
  });

  test("revokes copy access when the tab returns after the session ends", async () => {
    let signedIn = true;
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    globalThis.fetch = mock(async () => Response.json({
      user: signedIn
        ? {
            id: "user-1",
            name: "AgentUI user",
            email: "user@example.com",
            emailVerified: true,
            image: null,
            lastSignInAt: null,
            providers: ["google"],
          }
        : null,
    })) as unknown as typeof fetch;
    const view = render(
      <AuthProvider copyAuthRequired>
        <AuthProbe />
        <CopyButton text="component source" requiresAuth />
      </AuthProvider>,
    );
    await waitFor(() => expect(view.getByTestId("auth-status").textContent).toBe("authenticated"));

    signedIn = false;
    await act(async () => {
      fireEvent.focus(window);
    });
    await waitFor(() => expect(view.getByTestId("auth-status").textContent).toBe("signed-out"));

    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Copy code" }));
    });
    expect(writeText).not.toHaveBeenCalled();
    expect(view.getByText("Sign in to copy")).toBeTruthy();
  });

  test("revokes copy access when another tab signs out", async () => {
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    globalThis.fetch = mock(async () => Response.json({
      user: {
        id: "user-1",
        name: "AgentUI user",
        email: "user@example.com",
        emailVerified: true,
        image: null,
        lastSignInAt: null,
        providers: ["google"],
      },
    })) as unknown as typeof fetch;
    const view = render(
      <AuthProvider copyAuthRequired>
        <AuthProbe />
        <CopyButton text="component source" requiresAuth />
      </AuthProvider>,
    );
    await waitFor(() => expect(view.getByTestId("auth-status").textContent).toBe("authenticated"));

    await act(async () => {
      window.dispatchEvent(new StorageEvent("storage", { key: "agentui:auth:signed-out" }));
    });
    expect(view.getByTestId("auth-status").textContent).toBe("signed-out");

    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Copy code" }));
    });
    expect(writeText).not.toHaveBeenCalled();
    expect(view.getByText("Sign in to copy")).toBeTruthy();
  });

  test("checks the server session before copying from an authenticated tab", async () => {
    let requests = 0;
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    globalThis.fetch = mock(async () => {
      requests += 1;
      return Response.json({
        user: requests === 1
          ? {
              id: "user-1",
              name: "AgentUI user",
              email: "user@example.com",
              emailVerified: true,
              image: null,
              lastSignInAt: null,
              providers: ["google"],
            }
          : null,
      });
    }) as unknown as typeof fetch;
    const view = render(
      <AuthProvider copyAuthRequired>
        <AuthProbe />
        <CopyButton text="component source" requiresAuth />
      </AuthProvider>,
    );
    await waitFor(() => expect(view.getByTestId("auth-status").textContent).toBe("authenticated"));

    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Copy code" }));
    });
    expect(requests).toBe(2);
    expect(writeText).not.toHaveBeenCalled();
    expect(view.getByTestId("auth-status").textContent).toBe("signed-out");
    expect(view.getByText("Sign in to copy")).toBeTruthy();
  });

  test("keeps a deferred clipboard write alive through a focus refresh", async () => {
    const originalClipboardItem = globalThis.ClipboardItem;
    let resolveSession: ((response: Response) => void) | undefined;
    const pendingSession = new Promise<Response>((resolve) => { resolveSession = resolve; });
    let requests = 0;
    let written = "";
    class ClipboardItemStub {
      constructor(readonly data: Record<string, Promise<Blob>>) {}
    }
    Object.defineProperty(globalThis, "ClipboardItem", {
      configurable: true,
      value: ClipboardItemStub,
    });
    const write = mock(async (items: ClipboardItemStub[]) => {
      written = await items[0].data["text/plain"].then((blob) => blob.text());
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { write },
    });
    const user = {
      id: "user-1",
      name: "AgentUI user",
      email: "user@example.com",
      emailVerified: true,
      image: null,
      lastSignInAt: null,
      providers: ["google"],
    };
    globalThis.fetch = mock(async () => {
      requests += 1;
      return requests === 1 ? Response.json({ user }) : pendingSession;
    }) as unknown as typeof fetch;

    try {
      const view = render(
        <AuthProvider copyAuthRequired>
          <AuthProbe />
          <CopyButton text="component source" requiresAuth />
        </AuthProvider>,
      );
      await waitFor(() => expect(view.getByTestId("auth-status").textContent).toBe("authenticated"));

      act(() => {
        fireEvent.click(view.getByRole("button", { name: "Copy code" }));
      });
      expect(write).toHaveBeenCalledTimes(1);
      expect(written).toBe("");

      act(() => {
        fireEvent.focus(window);
      });

      await act(async () => {
        resolveSession?.(Response.json({ user }));
        await pendingSession;
      });
      await waitFor(() => expect(view.getByRole("button", { name: "Copied" })).toBeTruthy());
      expect(written).toBe("component source");
    } finally {
      Object.defineProperty(globalThis, "ClipboardItem", {
        configurable: true,
        value: originalClipboardItem,
      });
    }
  });

  test("closes sign-in if a session refresh finds an authenticated user", async () => {
    let requests = 0;
    globalThis.fetch = mock(async () => {
      requests += 1;
      return Response.json({
        user: requests === 1
          ? null
          : {
              id: "user-1",
              name: "AgentUI user",
              email: "user@example.com",
              emailVerified: true,
              image: null,
              lastSignInAt: null,
              providers: ["google"],
            },
      });
    }) as unknown as typeof fetch;
    const view = render(
      <AuthProvider copyAuthRequired>
        <AuthControl />
        <AuthProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(view.getByTestId("auth-status").textContent).toBe("signed-out"));
    fireEvent.click(view.getByRole("button", { name: "Sign in" }));
    expect(view.getByText("Sign in to AgentUI")).toBeTruthy();

    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Refresh session" }));
    });
    expect(view.getByTestId("auth-status").textContent).toBe("authenticated");
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog?.style.pointerEvents).toBe("none");
    expect(dialog?.closest("[inert]")).toBeTruthy();
  });

  test("opens sign in and leaves the clipboard untouched when signed out", async () => {
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const { getByRole, getByText } = renderCopyButton(true);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    const trigger = getByRole("button", { name: "Copy code" });
    await act(async () => {
      fireEvent.click(trigger);
    });

    expect(getByText("Sign in to copy")).toBeTruthy();
    expect(writeText).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(getByRole("button", { name: "Close modal" }));
    });
    expect(document.activeElement).toBe(trigger);
  });

  test("keeps the feature flag as a clean rollback path", async () => {
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const { getByRole, queryByText } = renderCopyButton(false);

    await act(async () => {
      fireEvent.click(getByRole("button", { name: "Copy code" }));
    });

    expect(writeText).toHaveBeenCalledWith("component source");
    expect(queryByText("Sign in to copy")).toBeNull();
  });

  test("header sign-in uses account copy and restores focus when closed", async () => {
    const { getByRole, getByText } = render(
      <AuthProvider copyAuthRequired>
        <AuthControl />
      </AuthProvider>,
    );

    const trigger = getByRole("button", { name: "Sign in" });
    await act(async () => {
      fireEvent.click(trigger);
    });

    expect(getByText("Sign in to AgentUI")).toBeTruthy();
    await act(async () => {
      fireEvent.click(getByRole("button", { name: "Close modal" }));
    });
    expect(document.activeElement).toBe(trigger);
  });

  test("reports a clipboard failure and allows another attempt", async () => {
    let available = false;
    const writeText = mock(async () => {
      if (!available) throw new Error("clipboard denied");
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const view = renderCopyButton(false);

    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Copy code" }));
    });

    expect(view.getByRole("button", { name: "Copy failed. Try again" })).toBeTruthy();
    expect(view.getByText("Could not copy. Try again.")).toBeTruthy();
    available = true;
    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Copy failed. Try again" }));
    });
    expect(view.getByRole("button", { name: "Copied" })).toBeTruthy();
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  test("keeps guide copy public while component page copy asks for sign-in", async () => {
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    globalThis.fetch = mock(async (input: RequestInfo | URL) => {
      if (String(input).endsWith("/motion-patterns.md")) {
        return new Response("# Motion guide");
      }
      return Response.json({ user: null });
    }) as unknown as typeof fetch;
    const view = render(
      <AuthProvider copyAuthRequired>
        <CopyPage
          pageUrl="https://www.agentui.pro/docs/motion-patterns"
          markdownPath="/docs/motion-patterns.md"
          componentName="Motion guide"
        />
        <CopyPage
          pageUrl="https://www.agentui.pro/components/agents/message"
          markdownPath="/components/agents/message.md"
          componentName="Message"
          requiresAuth
        />
      </AuthProvider>,
    );
    const copyButtons = view.getAllByRole("button", { name: "Copy page as Markdown" });

    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });
    expect(writeText).toHaveBeenCalledWith("# Motion guide");

    await act(async () => {
      fireEvent.click(copyButtons[1]);
    });
    expect(view.getByText("Sign in to copy")).toBeTruthy();
    expect(writeText).toHaveBeenCalledTimes(1);
  });
});
