import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SPONSORSHIP_CONTACT_PATH, SPONSORSHIP_PRICE } from "@/lib/sponsorship";
import { cn } from "@/lib/utils";

/** House creative for the single available component-docs placement. */
export function FeaturedDocsSponsor({ className }: { className?: string }) {
  return (
    <section
      aria-label="Sponsor AgentUI"
      className={cn("rounded-2xl border border-border-strong bg-card p-3", className)}
    >
      <div className="flex min-h-24 items-center justify-center gap-3 rounded-xl bg-[#111315] px-4 text-white">
        <Image
          src="/agentui-mark-v2.png"
          alt=""
          width={30}
          height={30}
          className="size-[30px] shrink-0 invert"
        />
        <span className="text-lg font-semibold tracking-[-0.025em]">AgentUI</span>
      </div>

      <div className="px-1 pb-1 pt-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Your brand here
        </h2>
        <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
          One featured spot across the component docs.
        </p>

        <p className="mt-4 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {SPONSORSHIP_PRICE}
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">/ month</span>
        </p>

        <Link
          href={SPONSORSHIP_CONTACT_PATH}
          className="mt-4 flex min-h-11 items-center justify-between gap-2 border-t border-border pt-3 text-sm font-medium text-foreground outline-none transition-colors duration-150 hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          Become a sponsor
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
