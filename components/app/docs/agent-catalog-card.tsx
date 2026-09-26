"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useInView } from "motion/react";
import { useRef } from "react";
import { PreviewFit } from "@/components/app/landing/preview-fit";
import { getPreview, previews } from "@/components/previews";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import type { ComponentEntry } from "@/lib/registry";
import { cn } from "@/lib/utils";

export const AGENT_CATALOG_LABELS: Record<string, string> = {
  "usage-dashboard": "Usage analytics",
  "message-bubble": "Chat bubble",
  message: "Message row",
  "message-scroller": "Conversation scroll",
  "prompt-input": "Chat input",
  "todo-list": "Task plan",
  "code-block": "Code preview",
  "approval-card": "Human approval",
  "file-diff": "File changes",
  "tool-result": "Tool output",
  "streaming-response": "Streaming answer",
  "image-generation": "Image generation",
  "tool-approval": "Tool permission",
  citations: "Source citations",
  "agent-activity": "Agent activity",
  "loading-states": "Loading states",
  "ai-sidebar": "Resource sidebar",
  "chat-app": "Agent workspace",
};

export function AgentCatalogCard({ component }: { component: ComponentEntry }) {
  const cardRef = useRef<HTMLElement>(null);
  const shouldRenderPreview = useInView(cardRef, {
    once: true,
    margin: "160px",
  });
  const Preview = component.landingPreviewKey
    ? previews[component.landingPreviewKey]
    : getPreview(
        "agents",
        component.slug,
        component.examples?.map((example) => example.previewKey),
      );
  const canHover = useHoverCapable();
  const label = AGENT_CATALOG_LABELS[component.slug] ?? component.name;

  return (
    <article
      ref={cardRef}
      data-slot="agent-catalog-card"
      className="group/card relative aspect-square min-w-0"
    >
      <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-200 group-hover/card:border-border-strong group-focus-within/card:border-border-strong">
        <div
          data-slot="agent-catalog-preview"
          aria-hidden="true"
          inert
          className="relative h-full overflow-hidden bg-card contain-[paint]"
        >
          {shouldRenderPreview && Preview ? (
            <PreviewFit
              hover={false}
              maxScale={0.76}
              className="rounded-none border-0 bg-transparent p-3 sm:p-4"
            >
              <Preview />
            </PreviewFit>
          ) : null}
        </div>

        <div
          data-slot="agent-catalog-label"
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-3 bottom-3 z-10 flex min-h-10 items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-[opacity,transform] duration-200 motion-reduce:transition-none",
            canHover
              ? "translate-y-2 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100"
              : "translate-y-0 opacity-100",
          )}
        >
          <span className="truncate">{label}</span>
          <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
        </div>

        <h3 className="sr-only">{component.name}</h3>
      </div>

      <Link
        href={`/components/agents/${component.slug}`}
        prefetch={false}
        aria-label={`${component.name}: ${label}`}
        className="absolute inset-0 z-20 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </article>
  );
}
