import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { publicRegistry } from "@/lib/registry";

const allAgents = publicRegistry[0]?.components ?? [];

const PRIMITIVES = [
  { name: "Chat App", href: "/components/agents/chat-app" },
  { name: "Prompt Input", href: "/components/agents/prompt-input" },
  { name: "Streaming Response", href: "/components/agents/streaming-response" },
  { name: "Agent Activity", href: "/components/agents/agent-activity" },
  { name: "Tool Approval", href: "/components/agents/tool-approval" },
  { name: "Approval Card", href: "/components/agents/approval-card" },
  { name: "Message Bubble", href: "/components/agents/message-bubble" },
];

const SURFACES = [
  { name: "AI Sidebar", href: "/components/agents/ai-sidebar" },
  { name: "Loading States", href: "/components/agents/loading-states" },
  { name: "Citations", href: "/components/agents/citations" },
  { name: "Image Generation", href: "/components/agents/image-generation" },
  { name: "Task Plan (Todo)", href: "/components/agents/todo-list" },
  { name: "Code Block", href: "/components/agents/code-block" },
  { name: "File Diff", href: "/components/agents/file-diff" },
];

const GUIDES = [
  { name: "Motion Patterns", href: "/docs/motion-patterns" },
  { name: "Theming & Tokens", href: "/docs/theme" },
  { name: "Playground", href: "/playground" },
];

const RESOURCES = [
  { name: "shadcn Registry", href: "/registry.json", isExternal: false },
  { name: "llms.txt", href: "/llms.txt", isExternal: false },
  { name: "Registry API", href: "/r/index.json", isExternal: false },
  { name: "Component Catalog", href: "/components/agents", isExternal: false },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-28 sm:px-6 lg:px-8 lg:pb-32">
        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 md:grid-cols-6 lg:gap-12">
          {/* Brand & Mission */}
          <div className="col-span-2 md:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
            >
              <Image
                src="/agentui-mark.png"
                alt="AgentUI"
                width={22}
                height={22}
                className="h-5.5 w-5.5 dark:invert"
              />
              <span className="font-display font-medium text-base">AgentUI</span>
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              Agent interface components for React and Next.js. Built with
              Motion and Tailwind CSS.
            </p>
          </div>

          {/* Column 1: Primitives */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Primitives
            </p>
            <ul className="mt-4 space-y-2.5">
              {PRIMITIVES.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/components/agents"
                  className="inline-flex items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  <span>View all ({allAgents.length})</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Surfaces */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Surfaces
            </p>
            <ul className="mt-4 space-y-2.5">
              {SURFACES.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Guides */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Guides
            </p>
            <ul className="mt-4 space-y-2.5">
              {GUIDES.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Resources
            </p>
            <ul className="mt-4 space-y-2.5">
              {RESOURCES.map((item) => (
                <li key={item.name}>
                  {item.isExternal ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span>{item.name}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-60" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 AgentUI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
