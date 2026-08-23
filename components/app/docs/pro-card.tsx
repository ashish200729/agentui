import { ArrowUpRight } from "lucide-react";
import { RainbowCta } from "@/components/app/rainbow-cta";

export function ProCard() {
  return (
    <section
      aria-labelledby="agentui-pro-card-title"
      className="mt-8 rounded-2xl p-4 border border-border"
    >
      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-success">
        AgentUI Pro · Lifetime access for $149
      </p>
      <h2
        id="agentui-pro-card-title"
        className="mt-2 text-xl font-semibold leading-tight tracking-tight text-foreground"
      >
        Ship faster with{" "}
        <span className="bg-brand-accent bg-clip-text text-transparent">
          AgentUI Pro
        </span>
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Premium AgentUI components and agent interface blocks for React and Next.js.
      </p>
      <RainbowCta
        href="https://pro.agentui.dev/?utm_source=agentui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=component_sidebar"
        target="_blank"
        rel="noreferrer noopener"
        className="mt-5"
      >
        Get lifetime access
        <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
      </RainbowCta>
    </section>
  );
}
