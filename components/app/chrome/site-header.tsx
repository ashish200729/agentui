"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MobileNav } from "@/components/app/chrome/mobile-nav";
import { PressLink } from "@/components/app/press-link";
import { SiteSearch } from "@/components/app/chrome/site-search";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isDocsShell =
    pathname.startsWith("/components") || pathname.startsWith("/docs");
  const isHome = pathname === "/";
  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 8);
  });

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "relative flex h-14 items-center justify-between gap-4",
          isDocsShell
            ? "w-full px-4 md:px-6 xl:px-8"
            : "mx-auto max-w-7xl px-4",
        )}
      >
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground"
          >
            <Image
              src="/agentui-mark-v2.png"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              className="h-6 w-6 dark:invert"
            />
            <span>AgentUI</span>
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          {isHome ? null : (
            // Between md and lg the field is back to its icon, so its label and
            // shortcut hint have to go with it — left in, they overflow the
            // 36px button and paint over the controls beside it.
            <SiteSearch className="w-9 justify-center px-0 sm:w-44 sm:justify-start sm:px-3 md:w-9 md:justify-center md:px-0 md:max-lg:[&>kbd]:hidden md:max-lg:[&>span]:hidden lg:w-56 lg:justify-start lg:px-3" />
          )}
          <PressLink
            href="/components/agents"
            className="group inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card/20 px-3 py-2 text-xs font-medium text-foreground hover:border-(--color-border-strong)"
            aria-label="Components"
          >
            Components
          </PressLink>
        </nav>
      </div>
    </header>
  );
}
