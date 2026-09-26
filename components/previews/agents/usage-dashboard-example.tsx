"use client";

import {
  UsageDashboard,
  type UsageRecord,
} from "@/components/agents/usage-dashboard";

// Illustrative records with real coding agents, providers, and model IDs.
// Token counts and billed amounts are examples, not live usage or price quotes.
export const sampleUsageRecords: UsageRecord[] = Array.from(
  { length: 30 },
  (_, index) => {
    const date = new Date(Date.UTC(2026, 7, index + 28))
      .toISOString()
      .slice(0, 10);
    const codexSwing = Math.sin(index * 0.62) * 0.25 + Math.cos(index * 0.17) * 0.12 + (index / 29) * 0.12;
    const claudeSwing = Math.cos(index * 0.47 + 0.8) * 0.22 + Math.sin(index * 0.21) * 0.1;
    const opusSwing = Math.sin(index * 0.86 + 1.2) * 0.2;
    const codexInput = Math.round(940_000 * (1 + codexSwing));
    const claudeInput = Math.round(710_000 * (1 + claudeSwing));
    const opusInput = Math.round(185_000 * (1 + opusSwing));

    return [
      {
        date,
        agent: "Codex",
        provider: "OpenAI",
        model: "gpt-6-sol",
        inputTokens: codexInput,
        cachedInputTokens: Math.round(codexInput * 0.42),
        outputTokens: Math.round(220_000 * (1 + codexSwing * 0.8)),
        requests: Math.round(125 * (1 + codexSwing * 0.4)),
        costUsd: Number((13.4 * (1 + codexSwing)).toFixed(2)),
      },
      {
        date,
        agent: "Claude Code",
        provider: "Anthropic",
        model: "claude-sonnet-5",
        inputTokens: claudeInput,
        cachedInputTokens: Math.round(claudeInput * 0.3),
        outputTokens: Math.round(176_000 * (1 + claudeSwing * 0.65)),
        requests: Math.round(97 * (1 + claudeSwing * 0.32)),
        costUsd: Number((11.8 * (1 + claudeSwing * 0.7)).toFixed(2)),
      },
      {
        date,
        agent: "Claude Code",
        provider: "Anthropic",
        model: "claude-opus-5-5",
        inputTokens: opusInput,
        cachedInputTokens: Math.round(opusInput * 0.19),
        outputTokens: Math.round(51_000 * (1 + opusSwing * 0.75)),
        requests: Math.round(22 * (1 + opusSwing * 0.35)),
        costUsd: Number((9.6 * (1 + opusSwing * 0.9)).toFixed(2)),
      },
    ];
  },
).flat();

export function UsageDashboardUsage() {
  return <UsageDashboard records={sampleUsageRecords} defaultRange={30} />;
}
