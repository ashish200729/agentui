"use client";

import { LoaderCircle, LogOut, TriangleAlert, UserRound } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./auth-provider";

export function AuthControl() {
  const { user, status, openSignIn, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutFailed(false);
    try {
      await signOut();
    } catch {
      setSignOutFailed(true);
    } finally {
      setSigningOut(false);
    }
  };

  if (status === "authenticated" && user) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 p-1">
        <span
          className="hidden max-w-32 truncate px-2 text-xs text-muted-foreground lg:block"
          title={user.email}
        >
          {user.name || user.email}
        </span>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          aria-label={signOutFailed ? "Sign out failed. Try again" : "Sign out"}
          title={signOutFailed ? "Could not sign out. Try again." : "Sign out"}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait"
        >
          {signingOut ? (
            <LoaderCircle className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
          ) : signOutFailed ? (
            <TriangleAlert className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
          ) : (
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
        {signOutFailed ? (
          <span role="alert" className="sr-only">Could not sign out. Try again.</span>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.currentTarget.focus();
        openSignIn();
      }}
      aria-label="Sign in"
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card/30 px-2.5 text-xs font-medium text-foreground outline-none transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
    >
      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Sign in</span>
    </button>
  );
}
