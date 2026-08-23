import Link from "next/link";
import { publicRegistry } from "@/lib/registry";

// The catalog keeps growing — the footer shows only the newest few per column.
const FOOTER_LIMIT = 8;

const allAgents = publicRegistry[0]?.components ?? [];
const agentComponents = allAgents.slice(-FOOTER_LIMIT).reverse();

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-4 pt-14 pb-10">
      <div className="mx-auto max-w-7xl">
        {/* Main grid */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-lg font-medium text-foreground">AgentUI</p>
            <p className="mt-2 max-w-[220px] text-sm leading-6 text-muted-foreground">
              Agent components for React and Next.js. Copy the source and own
              every interaction.
            </p>
          </div>

          {/* Components */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agent components
            </p>
            <ul className="space-y-2.5">
              {agentComponents.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/components/agents/${c.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/components/agents"
                  className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  View all ({allAgents.length})
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Links
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/components/agents"
                  className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
                >
                  Explore components
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/ai-agents"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Agent guide
                </Link>
              </li>
              <li>
                <Link
                  href="/components/agents"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Browse all agents
                </Link>
              </li>
              <li>
                <Link
                  href="/llms.txt"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  llms.txt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">© 2026 AgentUI. MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
