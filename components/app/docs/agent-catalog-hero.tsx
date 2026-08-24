import { ArrowDown } from "lucide-react";
import { PressLink } from "@/components/app/press-link";

export function AgentCatalogHero({ componentCount }: { componentCount: number }) {
  return (
    <section
      data-slot="agent-catalog-hero"
      className="flex min-h-[30rem] items-center border-b border-border py-16 sm:min-h-[34rem] sm:py-20 lg:min-h-[38rem]"
    >
      <div className="max-w-3xl">
        <h1 className="text-balance font-display text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-foreground sm:text-5xl xl:text-6xl">
          Components for the full agent loop.
        </h1>
        <p className="mt-6 max-w-[68ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Build the moments between a prompt and a trustworthy result. AgentUI
          covers conversations, progress, tools, evidence, and human decisions
          with React components you can own.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <PressLink
            href="#all-components"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Browse all {componentCount}
            <ArrowDown className="size-4" aria-hidden="true" />
          </PressLink>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Source included · shadcn-compatible · light and dark themes
        </p>
      </div>
    </section>
  );
}
