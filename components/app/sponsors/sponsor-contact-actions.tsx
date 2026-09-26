"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { SPONSORSHIP_EMAIL } from "@/lib/sponsorship";

type CopyStatus = "idle" | "copied" | "error";

export function SponsorContactActions() {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(SPONSORSHIP_EMAIL);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <div className="mt-6 max-w-xl rounded-xl border border-border-strong bg-card p-4 sm:p-5">
      <p className="text-xs font-medium text-muted-foreground">Sponsorship email</p>
      <p className="mt-1 break-all font-mono text-sm text-foreground select-text sm:text-base">
        {SPONSORSHIP_EMAIL}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void copyAddress()}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-strong bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copyStatus === "copied" ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copyStatus === "copied" ? "Copied" : "Copy address"}
        </button>
      </div>
      <p role="status" className="mt-3 min-h-5 text-xs text-muted-foreground">
        {copyStatus === "copied"
          ? "Address copied. Paste it into your email app."
          : copyStatus === "error"
            ? "Copy failed. Select the address above to use it."
            : "Copy the address and send from your inbox."}
      </p>
    </div>
  );
}
