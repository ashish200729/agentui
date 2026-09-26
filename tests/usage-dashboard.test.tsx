import { afterEach, describe, expect, test } from "bun:test";
import { fireEvent, render, cleanup, waitFor, within } from "@testing-library/react";
import { UsageDashboard } from "@/components/agents/usage-dashboard";
import {
  summarizeUsage,
  type UsageRecord,
} from "@/components/agents/usage-dashboard-data";

afterEach(cleanup);

const records: UsageRecord[] = [
  { date: "2026-09-01", provider: "North", model: "A", inputTokens: 100, cachedInputTokens: 40, outputTokens: 20, requests: 2, costUsd: 1.25 },
  { date: "2026-09-01", provider: "South", model: "B", inputTokens: 50, outputTokens: 10, requests: 1, costUsd: 0.5 },
  { date: "2026-09-03", provider: "North", model: "A", inputTokens: 200, cachedInputTokens: 100, outputTokens: 40, requests: 3, costUsd: 2.75 },
];

describe("usage dashboard data", () => {
  test("keeps totals, model breakdown, and UTC daily buckets consistent", () => {
    const summary = summarizeUsage(records, 7);
    expect(summary?.startDate).toBe("2026-08-28");
    expect(summary?.endDate).toBe("2026-09-03");
    expect(summary?.totals).toEqual({ inputTokens: 350, cachedInputTokens: 140, outputTokens: 70, requests: 6, costUsd: 4.5 });
    expect(summary?.daily.find((day) => day.date === "2026-09-02")?.inputTokens).toBe(0);
    expect(summary?.providers.map((provider) => provider.name)).toEqual(["North", "South"]);
    expect(summary?.models.map((model) => model.name)).toEqual(["A", "B"]);
    expect(summary?.models[0].inputTokens).toBe(300);
    expect(summary?.agentSeries[0]).toEqual({ name: "North", values: [0, 0, 0, 0, 120, 0, 240] });
  });

  test("rejects malformed and impossible records without corrupting totals", () => {
    const summary = summarizeUsage([
      ...records,
      { ...records[0], date: "2026-02-30" },
      { ...records[0], cachedInputTokens: 101 },
      { ...records[0], costUsd: Number.NaN },
      { ...records[0], requests: -1 },
    ], 7);
    expect(summary?.recordCount).toBe(3);
    expect(summary?.totals.costUsd).toBe(4.5);
    expect(summarizeUsage([], 7)).toBeNull();
  });

  test("accepts a valid day at the Unix epoch", () => {
    const summary = summarizeUsage([{ ...records[0], date: "1970-01-01" }], 7);
    expect(summary?.endDate).toBe("1970-01-01");
    expect(summary?.totals.inputTokens).toBe(100);
  });

  test("keeps the same coding agent on two providers separately attributed", () => {
    const summary = summarizeUsage([
      { ...records[0], agent: "Workbench" },
      { ...records[1], agent: "Workbench" },
    ], 7);
    expect(summary?.agents.map((agent) => agent.provider)).toEqual(["North", "South"]);
    expect(summary?.agentSeries.map((series) => series.name)).toEqual([
      "Workbench · North",
      "Workbench · South",
    ]);
  });
});

describe("UsageDashboard", () => {
  test("renders summary and switches the daily ledger between seven and thirty days", () => {
    const view = render(<UsageDashboard records={records} />);
    expect(view.getByText("Usage overview")).toBeTruthy();
    expect(view.getAllByText("$4.50").length).toBeGreaterThan(0);
    expect(view.getByRole("button", { name: "7 days" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(view.getByRole("button", { name: "30 days" }));
    expect(view.getByRole("button", { name: "30 days" }).getAttribute("aria-pressed")).toBe("true");
    expect(view.getByText(/Aug 5 – Sep 3, 2026/)).toBeTruthy();
  });

  test("shows an empty state instead of fabricated metrics", () => {
    const view = render(<UsageDashboard records={[]} />);
    expect(view.getByText("No usage in this period")).toBeTruthy();
    expect(view.queryByText("Billed spend")).toBeNull();
  });

  test("shows recognizable marks for supported providers and leaves custom providers unbranded", () => {
    const view = render(<UsageDashboard records={[
      { ...records[0], provider: "OpenAI", agent: "Codex" },
      { ...records[1], provider: "Anthropic", agent: "Claude Code" },
      { ...records[2], provider: "Custom", agent: "Workbench" },
    ]} />);
    expect(view.container.querySelectorAll('[data-provider-mark="openai"]').length).toBeGreaterThan(0);
    expect(view.container.querySelectorAll('[data-provider-mark="anthropic"]').length).toBeGreaterThan(0);
    expect(view.container.querySelector('[data-provider-mark="custom"]')).toBeNull();
  });

  test("shows agent-specific values on keyboard inspection and switches breakdowns", async () => {
    const view = render(<UsageDashboard records={records} />);
    const chart = view.getByRole("button", { name: /Daily token chart/ });
    fireEvent.focus(chart);
    expect(view.getAllByText("North").length).toBeGreaterThan(0);
    expect(view.getByText("240")).toBeTruthy();
    fireEvent.keyDown(chart, { key: "ArrowLeft" });
    expect(view.getByText("Sep 2")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Day" }));
    await waitFor(() => expect(view.getByText("Day · UTC")).toBeTruthy());
  });

  test("keeps content visible on a 30-to-7-day switch and pages older days", () => {
    const month: UsageRecord[] = Array.from({ length: 30 }, (_, index) => ({
      date: new Date(Date.UTC(2026, 8, index + 1)).toISOString().slice(0, 10),
      provider: "OpenAI",
      agent: "Codex",
      model: "gpt-6-sol",
      inputTokens: 100 + index,
      outputTokens: 20,
      requests: 1,
      costUsd: 0.5,
    }));
    const view = render(<UsageDashboard records={month} defaultRange={30} />);
    fireEvent.click(view.getByRole("button", { name: "Day" }));
    expect(view.getAllByRole("row")).toHaveLength(8);
    expect(within(view.getByRole("table")).getByText("Sep 24")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: /Older/ }));
    expect(within(view.getByRole("table")).getByText("Sep 17")).toBeTruthy();
    expect(within(view.getByRole("table")).queryByText("Sep 24")).toBeNull();

    fireEvent.click(view.getByRole("button", { name: "7 days" }));
    expect(view.getByText("Processed tokens")).toBeTruthy();
    expect(view.getAllByRole("row")).toHaveLength(8);
    expect(within(view.getByRole("table")).getByText("Sep 24")).toBeTruthy();
    expect(view.queryByRole("button", { name: /Older/ })).toBeNull();

    fireEvent.click(view.getByRole("button", { name: "30 days" }));
    expect(view.getByText("Processed tokens")).toBeTruthy();
    expect(within(view.getByRole("table")).getByText("Sep 24")).toBeTruthy();
  });
});
