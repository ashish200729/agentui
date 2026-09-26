"use client";

import { motion, useReducedMotion } from "motion/react";
import { type KeyboardEvent, type PointerEvent, useId, useMemo, useState } from "react";
import { SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import {
  summarizeUsage,
  type DailyUsage,
  type UsageBreakdown,
  type UsageRecord,
  type UsageTotals,
} from "./usage-dashboard-data";
import { UsageProviderMark } from "./usage-provider-mark";

export type { UsageRecord } from "./usage-dashboard-data";

export interface UsageDashboardProps {
  records: UsageRecord[];
  title?: string;
  /** Controlled range, in UTC calendar days. */
  range?: 7 | 30;
  defaultRange?: 7 | 30;
  onRangeChange?: (range: 7 | 30) => void;
  className?: string;
}

type AgentSeries = { name: string; values: number[] };

const seriesColors = [
  "var(--usage-first)",
  "var(--usage-second)",
  "var(--usage-third)",
  "var(--usage-fourth)",
];
const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat("en-US");
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: number) {
  return value > 0 && value < 0.01 ? "<$0.01" : money.format(value);
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(
    new Date(`${date}T00:00:00.000Z`),
  );
}

function tokenCount(totals: UsageTotals) {
  return totals.inputTokens + totals.outputTokens;
}

function chartPath(values: number[], max: number) {
  return values
    .map((value, index) => {
      const x = 46 + (index / Math.max(values.length - 1, 1)) * 684;
      const y = 22 + 178 * (1 - value / max);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function AgentChart({
  daily,
  series,
}: {
  daily: DailyUsage[];
  series: AgentSeries[];
}) {
  const gradientId = useId().replaceAll(":", "");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const peak = Math.max(1, ...series.flatMap((item) => item.values));
  const step = 10 ** Math.floor(Math.log10(peak));
  const max = Math.ceil((peak * 1.16) / step) * step;
  const activeDay = activeIndex === null ? null : daily[activeIndex];
  const activeX = activeIndex === null ? 0 : 46 + (activeIndex / Math.max(daily.length - 1, 1)) * 684;
  const labels = [0, Math.floor((daily.length - 1) / 2), daily.length - 1];

  const inspectPointer = (event: PointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const plotX = ((event.clientX - bounds.left) / bounds.width) * 760;
    const index = Math.round(((plotX - 46) / 684) * (daily.length - 1));
    setActiveIndex(Math.max(0, Math.min(daily.length - 1, index)));
  };

  const inspectKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setActiveIndex((previous) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return daily.length - 1;
      const current = previous ?? daily.length - 1;
      return Math.max(0, Math.min(daily.length - 1, current + (event.key === "ArrowRight" ? 1 : -1)));
    });
  };

  return (
    <div className="min-w-0">
      <div className="flex min-h-20 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Daily processed tokens</h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
            {series.map((item, index) => (
              <span key={item.name} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: seriesColors[index % seriesColors.length] }} />
                {item.name}
              </span>
            ))}
          </div>
        </div>
        <div className="min-w-28 shrink-0 text-right text-xs tabular-nums" aria-live="polite">
          {activeDay ? (
            <div className="rounded-lg border border-border bg-popover px-2.5 py-2 text-popover-foreground shadow-sm">
              <p className="font-medium">{formatDate(activeDay.date, { month: "short", day: "numeric" })}</p>
              {series.map((item) => (
                <p key={item.name} className="mt-0.5 flex items-center justify-between gap-3 text-muted-foreground">
                  <span className="truncate">{item.name}</span>
                  <span className="shrink-0 text-popover-foreground">{compact.format(item.values[activeIndex ?? 0])}</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="pt-1 text-muted-foreground">Inspect a day</p>
          )}
        </div>
      </div>
      <div className="relative mt-2 w-full">
        <button
          type="button"
          className="absolute inset-0 z-10 w-full cursor-crosshair rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Daily token chart. Move the pointer or use left and right arrow keys to inspect a day."
          onPointerMove={inspectPointer}
          onPointerDown={inspectPointer}
          onPointerLeave={(event) => { if (event.pointerType === "mouse") setActiveIndex(null); }}
          onFocus={() => setActiveIndex((previous) => previous ?? daily.length - 1)}
          onBlur={() => setActiveIndex(null)}
          onKeyDown={inspectKeyboard}
        />
        <svg viewBox="0 0 760 235" className="block w-full" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--usage-first)" stopOpacity="0.14" />
              <stop offset="1" stopColor="var(--usage-first)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((fraction) => {
            const y = 200 - fraction * 178;
            return (
              <g key={fraction}>
                <line x1="46" x2="730" y1={y} y2={y} className="stroke-border/80" strokeDasharray={fraction === 0 ? undefined : "3 5"} />
                <text x="38" y={y + 4} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">{compact.format(max * fraction)}</text>
              </g>
            );
          })}
          {series[0] && <path d={`${chartPath(series[0].values, max)} L730 200 L46 200 Z`} fill={`url(#${gradientId})`} />}
          {series.map((item, index) => (
            <path key={item.name} d={chartPath(item.values, max)} fill="none" stroke={seriesColors[index % seriesColors.length]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          ))}
          {activeDay && (
            <g>
              <line x1={activeX} x2={activeX} y1="22" y2="200" className="stroke-foreground/30" strokeDasharray="3 4" />
              {series.map((item, index) => (
                <circle key={item.name} cx={activeX} cy={22 + 178 * (1 - item.values[activeIndex ?? 0] / max)} r="4.5" fill={seriesColors[index % seriesColors.length]} stroke="var(--usage-surface)" strokeWidth="2" />
              ))}
            </g>
          )}
          {labels.map((index, labelIndex) => (
            <text key={index} x={46 + (index / Math.max(daily.length - 1, 1)) * 684} y="230" textAnchor={labelIndex === 0 ? "start" : labelIndex === 2 ? "end" : "middle"} className="fill-muted-foreground text-[10px]">
              {formatDate(daily[index].date, { month: "short", day: "numeric" })}
            </text>
          ))}
        </svg>
      </div>
      <p className="sr-only">Use the Day tab in Breakdown for exact daily values.</p>
    </div>
  );
}

function AgentSummary({ agents, totals }: { agents: UsageBreakdown[]; totals: UsageTotals }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">Processed tokens</p>
      <p className="mt-1 text-[clamp(2.6rem,7vw,4.1rem)] font-semibold leading-none tracking-[-0.07em] tabular-nums text-foreground">{compact.format(tokenCount(totals))}</p>
      <p className="mt-2 text-xs text-muted-foreground">Across {integer.format(totals.requests)} requests</p>
      <ul className="mt-7 space-y-4">
        {agents.map((agent, index) => (
          <li key={`${agent.name}\0${agent.provider}`} className="border-t border-border pt-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-medium text-foreground"><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: seriesColors[index % seriesColors.length] }} /><UsageProviderMark provider={agent.provider} className="size-[18px] text-foreground" /><span className="truncate">{agent.name}</span></span>
              <span className="shrink-0 font-medium tabular-nums text-foreground">{compact.format(tokenCount(agent))}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 pl-4 text-xs text-muted-foreground">
              <span className="truncate">{agent.provider} · {Math.round((tokenCount(agent) / Math.max(tokenCount(totals), 1)) * 100)}%</span>
              <span className="shrink-0 tabular-nums">{formatMoney(agent.costUsd)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-xl font-semibold tracking-[-0.04em] tabular-nums text-foreground sm:text-2xl">{value}</dd>
    </div>
  );
}

function Breakdown({
  models,
  daily,
  totals,
  reduceMotion,
  layoutId,
  view,
  onViewChange,
}: {
  models: UsageBreakdown[];
  daily: DailyUsage[];
  totals: UsageTotals;
  reduceMotion: boolean;
  layoutId: string;
  view: "model" | "day";
  onViewChange: (view: "model" | "day") => void;
}) {
  const [dayPage, setDayPage] = useState(0);
  const pageCount = Math.ceil(daily.length / 7);
  const pageIndex = Math.min(dayPage, pageCount - 1);
  const pageEnd = daily.length - pageIndex * 7;
  const visibleDays = daily.slice(Math.max(0, pageEnd - 7), pageEnd);

  return (
    <div className="pt-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">Breakdown</h3>
        <fieldset className="inline-flex rounded-full border border-border bg-muted/50 p-1">
          <legend className="sr-only">Breakdown view</legend>
          {(["model", "day"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => onViewChange(option)}
              className={cn("relative isolate min-h-8 rounded-full px-3.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", view === option ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {view === option && <motion.span layoutId={layoutId} className="absolute inset-0 -z-10 rounded-full border border-border/70 bg-background shadow-sm" transition={reduceMotion ? { duration: 0 } : SPRING_LAYOUT} />}
              {option === "model" ? "Model" : "Day"}
            </button>
          ))}
        </fieldset>
      </div>
      <div>
          {view === "model" ? (
            <table className="mt-5 w-full border-collapse text-left text-xs sm:text-sm">
              <thead><tr className="border-b border-border text-muted-foreground"><th scope="col" className="pb-3 font-medium">Model</th><th scope="col" className="hidden pb-3 text-right font-medium sm:table-cell">Share</th><th scope="col" className="pb-3 text-right font-medium">Cost</th><th scope="col" className="pb-3 text-right font-medium">Tokens</th></tr></thead>
              <tbody>{models.map((model) => (
                <tr key={`${model.provider}\0${model.name}`} className="border-b border-border/65 last:border-0">
                  <th scope="row" className="min-w-0 py-3 pr-2 font-medium text-foreground"><span className="flex items-center gap-2"><UsageProviderMark provider={model.provider} className="size-4 text-foreground" /><span className="break-all">{model.name}</span></span><span className="block font-normal text-muted-foreground">{model.provider}</span></th>
                  <td className="hidden py-3 text-right tabular-nums text-muted-foreground sm:table-cell">{Math.round((tokenCount(model) / Math.max(tokenCount(totals), 1)) * 100)}%</td>
                  <td className="py-3 text-right tabular-nums text-muted-foreground">{formatMoney(model.costUsd)}</td>
                  <td className="py-3 text-right font-medium tabular-nums text-foreground">{compact.format(tokenCount(model))}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : (
            <div className="mt-5">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead className="sticky top-0 bg-card"><tr className="border-b border-border text-muted-foreground"><th scope="col" className="pb-3 font-medium">Day · UTC</th><th scope="col" className="hidden pb-3 text-right font-medium sm:table-cell">Input</th><th scope="col" className="hidden pb-3 text-right font-medium sm:table-cell">Output</th><th scope="col" className="pb-3 text-right font-medium">Cost</th><th scope="col" className="pb-3 text-right font-medium">Tokens</th></tr></thead>
                <tbody>{visibleDays.map((day) => (
                  <tr key={day.date} className="border-b border-border/65 last:border-0">
                    <th scope="row" className="py-3 font-medium text-foreground">{formatDate(day.date, { month: "short", day: "numeric" })}</th>
                    <td className="hidden py-3 text-right tabular-nums text-muted-foreground sm:table-cell">{integer.format(day.inputTokens)}</td>
                    <td className="hidden py-3 text-right tabular-nums text-muted-foreground sm:table-cell">{integer.format(day.outputTokens)}</td>
                    <td className="py-3 text-right tabular-nums text-muted-foreground">{formatMoney(day.costUsd)}</td>
                    <td className="py-3 text-right font-medium tabular-nums text-foreground">{compact.format(tokenCount(day))}</td>
                  </tr>
                ))}</tbody>
              </table>
              {pageCount > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(visibleDays[0].date, { month: "short", day: "numeric" })} – {formatDate(visibleDays[visibleDays.length - 1].date, { month: "short", day: "numeric" })} · {visibleDays.length} of {daily.length} days
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pageIndex >= pageCount - 1}
                      onClick={() => setDayPage(pageIndex + 1)}
                      className="min-h-10 rounded-full border border-border px-3 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Older
                    </button>
                    <button
                      type="button"
                      disabled={pageIndex === 0}
                      onClick={() => setDayPage(pageIndex - 1)}
                      className="min-h-10 rounded-full border border-border px-3 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Newer →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}

/** Provider-billed usage overview. Pass real per-day records; the component never estimates prices. */
export function UsageDashboard({
  records,
  title = "Usage overview",
  range,
  defaultRange = 7,
  onRangeChange,
  className,
}: UsageDashboardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const rangeId = useId();
  const breakdownId = useId();
  const [localRange, setLocalRange] = useState<7 | 30>(defaultRange);
  const [breakdownView, setBreakdownView] = useState<"model" | "day">("model");
  const selectedRange = range ?? localRange;
  const usage = useMemo(() => summarizeUsage(records, selectedRange), [records, selectedRange]);

  const changeRange = (next: 7 | 30) => {
    if (range === undefined) setLocalRange(next);
    onRangeChange?.(next);
  };

  return (
    <section
      className={cn(
        "w-full max-w-5xl rounded-[1.35rem] border border-border bg-card p-4 text-card-foreground [--usage-first:#0e857e] [--usage-second:#7468bd] [--usage-third:#bd8562] [--usage-fourth:#6b9aad] [--usage-surface:#fff] dark:[--usage-first:#65d5c3] dark:[--usage-second:#b6a6f7] dark:[--usage-third:#d9a778] dark:[--usage-fourth:#87bdca] dark:[--usage-surface:#151515] sm:p-7",
        className,
      )}
      aria-label={title}
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.045em] text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {usage
              ? `${formatDate(usage.startDate, { month: "short", day: "numeric" })} – ${formatDate(usage.endDate, { month: "short", day: "numeric", year: "numeric" })} · UTC`
              : "No usage data yet"}
          </p>
        </div>
        <fieldset className="inline-flex rounded-full border border-border bg-muted/50 p-1">
          <legend className="sr-only">Usage period</legend>
          {([7, 30] as const).map((days) => (
            <button
              key={days}
              type="button"
              aria-pressed={selectedRange === days}
              onClick={() => changeRange(days)}
              className={cn("relative isolate min-h-9 rounded-full px-3.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", selectedRange === days ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {selectedRange === days && <motion.span layoutId={`${rangeId}-range`} className="absolute inset-0 -z-10 rounded-full border border-border/70 bg-background shadow-sm" transition={reduceMotion ? { duration: 0 } : SPRING_LAYOUT} />}
              {days} days
            </button>
          ))}
        </fieldset>
      </div>

      {!usage || usage.recordCount === 0 ? (
        <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 text-center">
          <p className="text-sm font-medium text-foreground">No usage in this period</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Pass daily, provider-billed records to see agent and model usage.</p>
        </div>
      ) : (
        <div>
            <div className="mt-7 grid gap-8 border-b border-border pb-7 lg:grid-cols-[minmax(200px,0.85fr)_minmax(0,2fr)] lg:gap-10">
              <AgentSummary agents={usage.agents} totals={usage.totals} />
              <AgentChart daily={usage.daily} series={usage.agentSeries} />
            </div>
            <div className="border-b border-border py-7">
              <h3 className="text-sm font-semibold text-foreground">Totals</h3>
              <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
                <Total label="Cached input" value={compact.format(usage.totals.cachedInputTokens)} />
                <Total label="Uncached input" value={compact.format(usage.totals.inputTokens - usage.totals.cachedInputTokens)} />
                <Total label="Output" value={compact.format(usage.totals.outputTokens)} />
                <Total label="Billed spend · USD" value={formatMoney(usage.totals.costUsd)} />
              </dl>
            </div>
            <Breakdown key={selectedRange} models={usage.models} daily={usage.daily} totals={usage.totals} reduceMotion={reduceMotion} layoutId={`${breakdownId}-view`} view={breakdownView} onViewChange={setBreakdownView} />
        </div>
      )}
    </section>
  );
}
