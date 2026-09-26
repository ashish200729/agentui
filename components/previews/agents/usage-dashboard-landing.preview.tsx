import { summarizeUsage } from "@/components/agents/usage-dashboard-data";
import { UsageProviderMark } from "@/components/agents/usage-provider-mark";
import { sampleUsageRecords } from "./usage-dashboard-example";

const sample = summarizeUsage(sampleUsageRecords, 7);

export function UsageDashboardLandingPreview() {
  if (!sample) return null;

  const total = sample.totals.inputTokens + sample.totals.outputTokens;
  const peak = Math.max(1, ...sample.agentSeries.flatMap((series) => series.values));
  const lines = sample.agentSeries.slice(0, 2).map((series) => {
    const points = series.values.map((value, index) => {
      const x = 16 + index * 69;
      const y = 74 - (value / peak) * 54;
      return { x, y };
    });
    return {
      name: series.name,
      path: points.map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`).join(" "),
      last: points.at(-1),
    };
  });

  return (
    <div className="flex h-[222px] w-[448px] flex-col justify-between px-4 py-3 text-foreground [--usage-accent:#0e857e] [--usage-secondary:#7468bd] dark:[--usage-accent:#65d5c3] dark:[--usage-secondary:#b6a6f7]">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">Usage</span>
        <span>Last 7 days · UTC</span>
      </div>
      <div className="flex items-end justify-between gap-5">
        <div>
          <div className="text-[35px] font-semibold leading-none tracking-[-0.06em] tabular-nums">{new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(total)}</div>
          <div className="mt-1 text-xs text-muted-foreground">processed tokens</div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="flex items-center justify-end gap-1.5 text-[13px] font-medium text-foreground"><UsageProviderMark provider="OpenAI" className="size-[18px]" />Codex <span className="mx-1 text-muted-foreground">/</span><UsageProviderMark provider="Anthropic" className="size-[18px]" />Claude Code</div>
          <div className="mt-1">OpenAI · Anthropic</div>
        </div>
      </div>
      <svg viewBox="0 0 448 80" className="h-20 w-full" role="img" aria-label="Illustrative Codex and Claude Code token trends over seven days">
        <line x1="16" x2="430" y1="76" y2="76" className="stroke-border" />
        {lines.map((line, index) => (
          <g key={line.name}>
            <path d={line.path} fill="none" stroke={index === 0 ? "var(--usage-accent)" : "var(--usage-secondary)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {line.last && <circle cx={line.last.x} cy={line.last.y} r="3" fill={index === 0 ? "var(--usage-accent)" : "var(--usage-secondary)"} />}
          </g>
        ))}
      </svg>
      <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span>Illustrative data</span>
        <span className="text-foreground">View dashboard ↗</span>
      </div>
    </div>
  );
}
