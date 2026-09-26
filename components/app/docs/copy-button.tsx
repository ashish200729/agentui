"use client";

import { Check, Copy, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ActionSwapCascadeIcon } from "@/components/motion/action-swap-cascade";
import { Button } from "@/components/motion/button";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/app/auth/auth-provider";

export function CopyButton({
  text,
  className,
  eventName = "copy_code",
  eventLabel,
  requiresAuth = false,
}: {
  text: string;
  className?: string;
  /** GA4 event name. Defaults to "copy_code". */
  eventName?: string;
  /** What was copied (component slug, filename, install command). */
  eventLabel?: string;
  /** Require an AgentUI website session before writing to the clipboard. */
  requiresAuth?: boolean;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<number | null>(null);
  const { copyText } = useAuth();

  useEffect(
    () => () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const resetLater = () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState("idle"), 1500);
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      pressScale={0.85}
      onClick={async (event) => {
        event.currentTarget.focus();
        if (resetTimer.current) window.clearTimeout(resetTimer.current);
        setCopyState("idle");
        let copiedText: string | null;
        try {
          copiedText = await copyText(() => text, requiresAuth);
        } catch {
          setCopyState("error");
          resetLater();
          return;
        }
        if (copiedText === null) return;
        setCopyState("copied");
        resetLater();
        trackEvent(eventName, { label: eventLabel, chars: text.length });
      }}
      aria-label={
        copyState === "copied"
          ? "Copied"
          : copyState === "error"
            ? "Copy failed. Try again"
            : "Copy code"
      }
      data-auth-required={requiresAuth || undefined}
      className={cn(
        "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <ActionSwapCascadeIcon value={copyState} className="h-3.5 w-3.5">
        {copyState === "copied" ? (
          <Check className="h-3.5 w-3.5 text-(--color-success)" />
        ) : copyState === "error" ? (
          <TriangleAlert className="h-3.5 w-3.5 text-destructive" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </ActionSwapCascadeIcon>
      <span role="status" className="sr-only">
        {copyState === "copied"
          ? "Copied"
          : copyState === "error"
            ? "Could not copy. Try again."
            : ""}
      </span>
    </Button>
  );
}
