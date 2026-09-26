"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import {
  CenterMorphModal,
  CenterMorphModalContent,
} from "@/components/motion/center-morph-modal";
import { authClient } from "@/lib/auth-client";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z"
      />
      <path
        fill="currentColor"
        opacity=".78"
        d="M12 22c2.7 0 4.98-.9 6.63-2.38l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"
      />
      <path
        fill="currentColor"
        opacity=".56"
        d="M6.39 13.92A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.53l3.35-2.61Z"
      />
      <path
        fill="currentColor"
        opacity=".36"
        d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M12 .75A11.25 11.25 0 0 0 8.44 22.67c.56.1.77-.24.77-.54v-2.2c-3.14.68-3.8-1.33-3.8-1.33-.52-1.3-1.26-1.65-1.26-1.65-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.74.4-1.24.72-1.53-2.5-.29-5.14-1.25-5.14-5.56 0-1.23.44-2.23 1.17-3.02-.12-.29-.51-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.7 10.7 0 0 1 5.65 0c2.15-1.46 3.1-1.15 3.1-1.15.62 1.55.23 2.69.11 2.98.73.79 1.17 1.79 1.17 3.02 0 4.32-2.64 5.27-5.16 5.55.41.35.77 1.04.77 2.1v3.16c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" />
    </svg>
  );
}

export function SignInDialog({
  open,
  onOpenChange,
  status,
  purpose,
  callbackURL,
  onRetry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "authenticated" | "loading" | "signed-out" | "unavailable";
  purpose: "account" | "copy";
  callbackURL: string;
  onRetry: () => Promise<void>;
}) {
  const [pendingProvider, setPendingProvider] = useState<"google" | "github" | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retry = async () => {
    if (retrying) return;
    setRetrying(true);
    setError(null);
    try {
      await onRetry();
    } catch {
      setError("Could not reconnect to sign-in. Try again.");
    } finally {
      setRetrying(false);
    }
  };

  const signIn = async (provider: "google" | "github") => {
    if (pendingProvider) return;
    setPendingProvider(provider);
    setError(null);
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL,
        errorCallbackURL: callbackURL,
      });
      if (result.error) {
        setError(`Could not start ${provider === "google" ? "Google" : "GitHub"} sign-in. Try again.`);
      }
    } catch {
      setError("Sign-in is temporarily unavailable. Try again.");
    } finally {
      setPendingProvider(null);
    }
  };

  return (
    <CenterMorphModal
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <CenterMorphModalContent
        ariaLabel="Sign in to AgentUI"
        ariaDescribedBy="agentui-sign-in-description"
        animation="panel"
        className="max-w-[25rem] rounded-2xl"
        surfaceClassName="border-border-strong bg-card"
        backdropClassName="bg-black/12 backdrop-blur-none dark:bg-black/20"
      >
        <div className="p-6 sm:p-7">
          <h2 className="pr-10 text-xl font-semibold tracking-tight text-foreground">
            {purpose === "copy" ? "Sign in to copy" : "Sign in to AgentUI"}
          </h2>
          <p id="agentui-sign-in-description" className="mt-2 text-sm leading-6 text-muted-foreground">
            {purpose === "copy"
              ? "Continue with Google or GitHub, then return to this page to copy your component."
              : "Continue with Google or GitHub to use AgentUI."}
          </p>

          {status === "unavailable" ? (
            <div className="mt-6 rounded-xl bg-muted p-4">
              <p className="text-sm font-medium text-foreground">Authentication is unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {purpose === "copy"
                  ? "The component is still readable. Retry before copying."
                  : "Check your connection and try again."}
              </p>
              <button
                type="button"
                onClick={() => void retry()}
                disabled={retrying}
                aria-busy={retrying}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
              >
                {retrying ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
                {retrying ? "Retrying" : "Retry"}
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-2.5">
              {([
                ["google", "Continue with Google", <GoogleMark key="google" />],
                ["github", "Continue with GitHub", <GitHubMark key="github" />],
              ] as const).map(([provider, label, icon]) => (
                <button
                  key={provider}
                  type="button"
                  disabled={pendingProvider !== null}
                  onClick={() => void signIn(provider)}
                  className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground outline-none transition-colors hover:border-border-strong hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
                >
                  {pendingProvider === provider ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    icon
                  )}
                  {label}
                </button>
              ))}
            </div>
          )}

          {error ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            Your name, verified email, avatar, and sign-in time are saved to your AgentUI account.
          </p>
        </div>
      </CenterMorphModalContent>
    </CenterMorphModal>
  );
}
