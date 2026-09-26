"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MobileNav } from "@/components/app/chrome/mobile-nav";
import { AuthControl } from "@/components/app/auth/auth-control";
import { SiteSearch } from "@/components/app/chrome/site-search";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isDocsShell =
    pathname.startsWith("/components") || pathname.startsWith("/docs");
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";
  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 8);
  });

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled || isAdmin
          ? "border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "relative flex h-14 items-center justify-between gap-4",
          isDocsShell
            ? "w-full px-4 md:px-6 xl:px-8"
            : isAdmin
              ? "mx-auto max-w-5xl px-4 sm:px-6"
              : "mx-auto max-w-7xl px-4",
        )}
      >
        <div className="flex items-center gap-4">
          {isAdmin ? null : <MobileNav />}
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
            <span>{isAdmin ? "AgentUI Admin" : "AgentUI"}</span>
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          {isAdmin ? null : isHome ? null : (
            // Between md and lg the field is back to its icon, so its label and
            // shortcut hint have to go with it — left in, they overflow the
            // 36px button and paint over the controls beside it.
            <SiteSearch className="w-9 justify-center px-0 sm:w-44 sm:justify-start sm:px-3 md:w-9 md:justify-center md:px-0 md:max-lg:[&>kbd]:hidden md:max-lg:[&>span]:hidden lg:w-56 lg:justify-start lg:px-3" />
          )}
          {isAdmin ? null : (
            <>
              <Link
                href="/components/agents"
                className="hidden h-9 items-center justify-center rounded-2xl border border-border bg-card/20 px-3 text-xs font-medium text-foreground outline-none transition-colors duration-150 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
                aria-label="Components"
              >
                Components
              </Link>
              <Link
                href="/sponsors"
                aria-current={pathname === "/sponsors" ? "page" : undefined}
                className="hidden h-9 items-center justify-center rounded-2xl border border-border bg-card/20 px-3 text-xs font-medium text-foreground outline-none transition-colors duration-150 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
              >
                Sponsor
              </Link>
              <AuthControl />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
