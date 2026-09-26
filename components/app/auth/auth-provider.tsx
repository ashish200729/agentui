"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  authClient,
  fetchCurrentUser,
  type PublicUser,
} from "@/lib/auth-client";
import { SignInDialog } from "./sign-in-dialog";

type AuthStatus = "authenticated" | "loading" | "signed-out" | "unavailable";
type SignInPurpose = "account" | "copy";
type CopyText = () => string | Promise<string>;

class CopyAuthError extends Error {}

type AuthContextValue = {
  user: PublicUser | null;
  status: AuthStatus;
  copyAuthRequired: boolean;
  openSignIn: () => void;
  refreshSession: () => Promise<void>;
  copyText: (
    getText: CopyText,
    requiresAuth?: boolean,
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_REFRESH_MS = 5 * 60 * 1000;
const SIGN_OUT_STORAGE_KEY = "agentui:auth:signed-out";

export function AuthProvider({
  children,
  copyAuthRequired,
}: {
  children: ReactNode;
  copyAuthRequired: boolean;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [signInPurpose, setSignInPurpose] = useState<SignInPurpose>("account");
  const refreshRequest = useRef(0);
  const refreshController = useRef<AbortController | null>(null);
  const copyRequest = useRef(0);
  const copyController = useRef<AbortController | null>(null);

  const refreshSession = useCallback(async () => {
    const request = ++refreshRequest.current;
    refreshController.current?.abort();
    const controller = new AbortController();
    refreshController.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 8_000);
    try {
      const nextUser = await fetchCurrentUser(controller.signal);
      if (request !== refreshRequest.current) return;
      setUser(nextUser);
      setStatus(nextUser ? "authenticated" : "signed-out");
      if (nextUser) setDialogOpen(false);
    } catch {
      if (request !== refreshRequest.current) return;
      setUser(null);
      setStatus("unavailable");
    } finally {
      window.clearTimeout(timeout);
      if (refreshController.current === controller) refreshController.current = null;
    }
  }, []);

  useEffect(() => {
    void refreshSession();

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") void refreshSession();
    };
    const handleSignOutInAnotherTab = (event: StorageEvent) => {
      if (event.key !== SIGN_OUT_STORAGE_KEY) return;
      refreshRequest.current += 1;
      refreshController.current?.abort();
      copyRequest.current += 1;
      copyController.current?.abort();
      setUser(null);
      setStatus("signed-out");
    };
    // A page can stay mounted beyond session expiry or after sign-out in
    // another tab. Keep the copy gate in sync without delaying clipboard
    // writes past the browser's user-activation window.
    window.addEventListener("focus", refreshIfVisible);
    window.addEventListener("storage", handleSignOutInAnotherTab);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.removeEventListener("focus", refreshIfVisible);
      window.removeEventListener("storage", handleSignOutInAnotherTab);
      document.removeEventListener("visibilitychange", refreshIfVisible);
      refreshRequest.current += 1;
      refreshController.current?.abort();
      copyRequest.current += 1;
      copyController.current?.abort();
    };
  }, [refreshSession]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshSession();
    }, SESSION_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [refreshSession, status]);

  const copyText = useCallback(
    async (getText: CopyText, requiresAuth = true) => {
      if (!requiresAuth || !copyAuthRequired) {
        const text = getText();
        const resolved = typeof text === "string" ? text : await text;
        await navigator.clipboard.writeText(resolved);
        return resolved;
      }
      if (status !== "authenticated") {
        setSignInPurpose("copy");
        setDialogOpen(true);
        return null;
      }

      // A focus refresh may race with this copy. Keep its validation alive;
      // only another copy or a sign-out can cancel it.
      const request = ++copyRequest.current;
      refreshController.current?.abort();
      refreshRequest.current += 1;
      copyController.current?.abort();
      const controller = new AbortController();
      copyController.current = controller;
      const timeout = window.setTimeout(() => controller.abort(), 8_000);
      const textPromise = fetchCurrentUser(controller.signal).then(
        (nextUser) => {
          if (request !== copyRequest.current) throw new CopyAuthError();
          if (!nextUser) {
            setUser(null);
            setStatus("signed-out");
            setSignInPurpose("copy");
            setDialogOpen(true);
            throw new CopyAuthError();
          }
          setUser(nextUser);
          return getText();
        },
        () => {
          if (request === copyRequest.current) {
            setUser(null);
            setStatus("unavailable");
            setSignInPurpose("copy");
            setDialogOpen(true);
          }
          throw new CopyAuthError();
        },
      ).finally(() => {
        window.clearTimeout(timeout);
        if (copyController.current === controller) copyController.current = null;
      });

      // Start the write during the click. ClipboardItem resolves its text only
      // after the server verifies the session, preserving Safari's user gesture.
      let writePromise: Promise<void>;
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        const blobPromise = textPromise.then((text) => new Blob([text], { type: "text/plain" }));
        try {
          writePromise = navigator.clipboard.write([
            new ClipboardItem({ "text/plain": blobPromise }),
          ]);
        } catch (error) {
          controller.abort();
          void blobPromise.catch(() => undefined);
          throw error;
        }
      } else {
        writePromise = textPromise.then((text) => navigator.clipboard.writeText(text));
      }

      const [textResult, writeResult] = await Promise.allSettled([textPromise, writePromise]);
      if (textResult.status === "rejected") {
        if (textResult.reason instanceof CopyAuthError) return null;
        throw textResult.reason;
      }
      if (writeResult.status === "rejected") throw writeResult.reason;
      return textResult.value;
    },
    [copyAuthRequired, status],
  );

  const signOut = useCallback(async () => {
    refreshRequest.current += 1;
    refreshController.current?.abort();
    copyRequest.current += 1;
    copyController.current?.abort();
    const result = await authClient.signOut();
    if (result.error) throw new Error("SIGN_OUT_FAILED");
    refreshRequest.current += 1;
    refreshController.current?.abort();
    copyRequest.current += 1;
    copyController.current?.abort();
    setUser(null);
    setStatus("signed-out");
    try {
      window.localStorage.setItem(SIGN_OUT_STORAGE_KEY, String(Date.now()));
    } catch {
      // Storage can be unavailable; focus and periodic checks still refresh other tabs.
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      copyAuthRequired,
      openSignIn: () => {
        setSignInPurpose("account");
        setDialogOpen(true);
      },
      refreshSession,
      copyText,
      signOut,
    }),
    [copyAuthRequired, copyText, refreshSession, signOut, status, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SignInDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        status={status}
        purpose={signInPurpose}
        callbackURL={typeof window === "undefined" ? pathname : window.location.href}
        onRetry={refreshSession}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
