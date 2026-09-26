"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import type { ComponentEntry } from "@/lib/registry";
import { NewBadge } from "@/components/app/docs/new-badge";
import { PreviewFit } from "@/components/app/landing/preview-fit";
import { getPreview, previews } from "@/components/previews";
import { EASE_OUT_CSS, SPRING_LAYOUT } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "wide" | "feature";

const VARIANT_SPAN: Record<CardVariant, string> = {
  default: "",
  wide: "sm:col-span-2",
  feature: "sm:col-span-2 sm:row-span-2",
};

export function LandingComponentCard({
  component,
  category = "motion",
  variant = "default",
  previewKey,
}: {
  component: ComponentEntry;
  category?: string;
  variant?: CardVariant;
  previewKey?: string;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const shouldRenderPreview = useInView(cardRef, {
    once: true,
    margin: "0px",
  });
  const cardPreviewKey = previewKey ?? component.landingPreviewKey;
  const Preview = cardPreviewKey
    ? previews[cardPreviewKey]
    : getPreview(
        category,
        component.slug,
        component.examples?.map((example) => example.previewKey),
      );
  const reduceMotion = useReducedMotion();
  const canHover = useHoverCapable();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const engaged = (canHover && hovered) || focused;
  const motionEngaged = engaged && !reduceMotion;
  const feature = variant === "feature";

  return (
    <motion.article
      ref={cardRef}
      data-slot="landing-component-card"
      className={cn("group/card relative h-full", VARIANT_SPAN[variant])}
      animate={{ y: motionEngaged ? -3 : 0 }}
      transition={reduceMotion ? { duration: 0 } : SPRING_LAYOUT}
      onPointerEnter={() => {
        if (canHover) setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <Link
        href={`/components/${category}/${component.slug}`}
        prefetch={false}
        aria-label={`View ${component.name}`}
        className="absolute inset-0 z-20 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <div className="flex h-full flex-col">
        <div className="relative flex min-h-0 flex-1">
          {shouldRenderPreview ? (
            <PreviewFit
              hover={motionEngaged}
              maxScale={feature ? 1 : 0.82}
              className={cn(
                "border transition-colors duration-300",
                engaged ? "border-border-strong" : "border-border",
              )}
            >
              {Preview ? <Preview /> : null}
            </PreviewFit>
          ) : (
            <div
              data-slot="landing-preview"
              aria-hidden="true"
              className={cn(
                "relative h-full min-h-0 rounded-2xl border bg-card transition-colors duration-300",
                engaged ? "border-border-strong" : "border-border",
              )}
            />
          )}

        </div>

        <div
          data-slot="landing-component-meta"
          className="mt-3 flex h-16 shrink-0 items-start justify-between gap-3 overflow-hidden px-1"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "truncate font-display font-semibold tracking-tight text-foreground",
                  feature ? "text-lg" : "text-base",
                )}
              >
                {component.name}
              </h3>
              {component.badge === "new" ? (
                <NewBadge launchedAt={component.launchedAt} />
              ) : null}
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {component.description}
            </p>
          </div>
          <ArrowUpRight
            data-slot="landing-component-arrow"
            aria-hidden="true"
            className={cn(
              "mt-0.5 size-4 shrink-0 transition-[color,opacity,transform] duration-200 motion-reduce:transition-none",
              engaged
                ? "text-foreground opacity-100"
                : "text-muted-foreground opacity-40",
              motionEngaged ? "translate-x-0" : "-translate-x-0.5",
            )}
            style={{ transitionTimingFunction: EASE_OUT_CSS }}
          />
        </div>
      </div>
    </motion.article>
  );
}
