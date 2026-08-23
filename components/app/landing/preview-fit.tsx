"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { EASE_OUT_CSS } from "@/lib/ease";
import { cn } from "@/lib/utils";

// Cap so a preview never renders larger than intended; only previews bigger
// than the card shrink further to actually fit — no clipping. `maxScale`
// per-card lets feature tiles show their preview larger than grid tiles.
const HOVER_LIFT = 1.025;
const MIN_SCALE = 0.22;

// A real desktop width for the preview to render at before it gets scaled
// down — the same idea as screenshotting the full-size preview, then
// shrinking the image. Without this, a preview whose root is `w-full` has no
// definite width to resolve against inside a shrink-wrapped box, so the
// browser collapses it to the width of its narrowest fixed-size child and
// wraps everything else around that — the "mobile view" column look.
const STAGE_WIDTH = 460;

/**
 * Shrinks a preview to fit the card frame instead of clipping or collapsing.
 * Renders the preview at a fixed desktop-like stage width (so `w-full`
 * layouts inside it lay out the same as they would on their own detail page),
 * measures the natural rendered height at that width, and scales the whole
 * stage down to fit the card — capped so normal-size previews look the same
 * as the original flat scale.
 */
export function PreviewFit({
  children,
  hover,
  overlay,
  maxScale = 0.82,
  className,
}: {
  children: ReactNode;
  hover: boolean;
  overlay?: ReactNode;
  maxScale?: number;
  className?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(MIN_SCALE);
  const [measured, setMeasured] = useState(false);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const stage = stageRef.current;
    if (!outer || !stage) return;

    const measure = () => {
      // clientWidth/offsetHeight are the pre-transform layout size — unlike
      // getBoundingClientRect, which reflects the scale() applied to this
      // same element and would otherwise make each measurement read an
      // already-shrunk box, compounding into the wrong scale every render.
      const outerW = outer.clientWidth;
      const outerH = outer.clientHeight;
      const childSizes = Array.from(stage.children, (child) => {
        const element = child as HTMLElement;
        return {
          width: Math.max(element.offsetWidth, element.scrollWidth),
          height: Math.max(element.offsetHeight, element.scrollHeight),
        };
      });
      const contentW = Math.max(
        stage.offsetWidth,
        stage.scrollWidth,
        ...childSizes.map(({ width }) => width),
      );
      const contentH = Math.max(
        stage.offsetHeight,
        stage.scrollHeight,
        ...childSizes.map(({ height }) => height),
      );
      if (!outerW || !outerH || !contentW || !contentH) return;
      const fit = Math.min(
        (outerW * 0.94) / contentW,
        (outerH * 0.94) / contentH,
      );
      setFitScale(Math.max(MIN_SCALE, fit));
      setMeasured(true);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    ro.observe(stage);
    Array.from(stage.children).forEach((child) => {
      ro.observe(child);
    });
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(maxScale, fitScale) * (hover ? HOVER_LIFT : 1);

  return (
    <div
      ref={outerRef}
      data-slot="landing-preview"
      className={cn(
        "relative m-0 flex h-full min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-2xl bg-card p-4 contain-[paint]",
        className,
      )}
    >
      <div
        ref={stageRef}
        style={{
          width: STAGE_WIDTH,
          transform: `scale(${scale})`,
          transitionTimingFunction: EASE_OUT_CSS,
        }}
        className={cn(
          "pointer-events-none flex origin-center shrink-0 items-center justify-center [&_*]:!cursor-default",
          measured
            ? "transition-transform duration-300 motion-reduce:transition-none"
            : "invisible",
        )}
      >
        {children}
      </div>
      {overlay}
    </div>
  );
}
