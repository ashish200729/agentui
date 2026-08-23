"use client";

import type { ComponentProps, ReactNode } from "react";
import { PressLink } from "@/components/app/press-link";
import { cn } from "@/lib/utils";

export interface MovingGradientButtonProps
  extends Omit<ComponentProps<typeof PressLink>, "children"> {
  children: ReactNode;
  innerClassName?: string;
}

/**
 * Hero CTA adapted from Originkit's Moving Gradient Button. The supplied
 * component's rotating conic-gradient band is kept, while AgentUI's PressLink,
 * semantic theme tokens, focus treatment, and reduced-motion behavior own the
 * interaction.
 */
export function MovingGradientButton({
  children,
  className,
  innerClassName,
  ...props
}: MovingGradientButtonProps) {
  return (
    <PressLink
      className={cn(
        "group relative isolate inline-flex min-h-10 overflow-hidden rounded-full bg-border p-[2px] text-sm font-medium text-background shadow-[0_8px_24px_oklch(0_0_0/0.12)] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:shadow-[0_8px_28px_oklch(0_0_0/0.35)]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <span className="absolute left-1/2 top-1/2 h-[240%] w-[150%] -translate-x-1/2 -translate-y-1/2">
          <span
            className="block h-full w-full animate-[spin_4.8s_linear_infinite] bg-[conic-gradient(from_0deg,var(--accent),var(--violet),var(--success),var(--accent))] motion-reduce:animate-none"
          />
        </span>
      </span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[2px] rounded-[inherit] bg-foreground transition-[filter] duration-200 ease-out group-hover:brightness-110 dark:group-hover:brightness-90 motion-reduce:transition-none"
      />

      <span
        className={cn(
          "relative z-10 inline-flex flex-1 items-center justify-center gap-2 px-4 text-background",
          innerClassName,
        )}
      >
        {children}
      </span>
    </PressLink>
  );
}
