export interface UsageRecord {
  /** UTC calendar day in YYYY-MM-DD format. */
  date: string;
  provider: string;
  model: string;
  /** Optional coding agent or client, such as Codex or Claude Code. */
  agent?: string;
  /** Input includes cached input; do not add cachedInputTokens to it. */
  inputTokens: number;
  cachedInputTokens?: number;
  outputTokens: number;
  requests: number;
  /** Billed amount from the provider, in USD. No price is inferred. */
  costUsd: number;
}

export interface UsageTotals {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  requests: number;
  costUsd: number;
}

export interface DailyUsage extends UsageTotals {
  date: string;
}

export interface UsageBreakdown extends UsageTotals {
  name: string;
  provider?: string;
}

const DAY_MS = 86_400_000;

function dayStamp(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const stamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value
    ? stamp
    : null;
}

function isValidRecord(record: UsageRecord): boolean {
  const values = [
    record.inputTokens,
    record.cachedInputTokens ?? 0,
    record.outputTokens,
    record.requests,
    record.costUsd,
  ];
  return (
    dayStamp(record.date) !== null &&
    record.provider.trim().length > 0 &&
    record.model.trim().length > 0 &&
    (record.agent === undefined || record.agent.trim().length > 0) &&
    values.every((value) => Number.isFinite(value) && value >= 0) &&
    values.slice(0, 4).every(Number.isInteger) &&
    (record.cachedInputTokens ?? 0) <= record.inputTokens
  );
}

function emptyTotals(): UsageTotals {
  return { inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, requests: 0, costUsd: 0 };
}

function addTotals(target: UsageTotals, record: UsageRecord): void {
  target.inputTokens += record.inputTokens;
  target.cachedInputTokens += record.cachedInputTokens ?? 0;
  target.outputTokens += record.outputTokens;
  target.requests += record.requests;
  target.costUsd += record.costUsd;
}

/** Aggregates a complete UTC window, including zero-use days. Never estimates cost. */
export function summarizeUsage(records: UsageRecord[], days: 7 | 30) {
  const valid = records.filter(isValidRecord);
  const latest = valid.reduce<number | null>((max, record) => {
    const stamp = dayStamp(record.date);
    return stamp === null ? max : max === null ? stamp : Math.max(max, stamp);
  }, null);
  if (latest === null) return null;

  const first = latest - (days - 1) * DAY_MS;
  const daily: DailyUsage[] = Array.from({ length: days }, (_, index) => ({
    date: new Date(first + index * DAY_MS).toISOString().slice(0, 10),
    ...emptyTotals(),
  }));
  const totals = emptyTotals();
  const providers = new Map<string, UsageBreakdown>();
  const agents = new Map<string, UsageBreakdown>();
  const agentDaily = new Map<string, number[]>();
  const models = new Map<string, UsageBreakdown>();
  let recordCount = 0;

  for (const record of valid) {
    const stamp = dayStamp(record.date) ?? 0;
    if (stamp < first || stamp > latest) continue;
    recordCount += 1;
    addTotals(daily[(stamp - first) / DAY_MS], record);
    addTotals(totals, record);

    let provider = providers.get(record.provider);
    if (!provider) {
      provider = { name: record.provider, ...emptyTotals() };
      providers.set(record.provider, provider);
    }
    addTotals(provider, record);

    const agentName = record.agent ?? record.provider;
    const agentKey = `${agentName}\0${record.provider}`;
    let agent = agents.get(agentKey);
    if (!agent) {
      agent = { name: agentName, provider: record.provider, ...emptyTotals() };
      agents.set(agentKey, agent);
    }
    addTotals(agent, record);
    let dailyTokens = agentDaily.get(agentKey);
    if (!dailyTokens) {
      dailyTokens = Array(days).fill(0);
      agentDaily.set(agentKey, dailyTokens);
    }
    dailyTokens[(stamp - first) / DAY_MS] += record.inputTokens + record.outputTokens;

    const key = `${record.provider}\0${record.model}`;
    let model = models.get(key);
    if (!model) {
      model = { name: record.model, provider: record.provider, ...emptyTotals() };
      models.set(key, model);
    }
    addTotals(model, record);
  }

  const byTokens = (a: UsageBreakdown, b: UsageBreakdown) =>
    b.inputTokens + b.outputTokens - (a.inputTokens + a.outputTokens) || a.name.localeCompare(b.name);

  const sortedAgents = [...agents.values()].sort(byTokens);
  const agentNameCounts = new Map<string, number>();
  for (const agent of sortedAgents) {
    agentNameCounts.set(agent.name, (agentNameCounts.get(agent.name) ?? 0) + 1);
  }

  return {
    daily,
    totals,
    providers: [...providers.values()].sort(byTokens),
    agents: sortedAgents,
    agentSeries: sortedAgents.map((agent) => ({
      name: (agentNameCounts.get(agent.name) ?? 0) > 1 ? `${agent.name} · ${agent.provider}` : agent.name,
      values: agentDaily.get(`${agent.name}\0${agent.provider}`) ?? Array(days).fill(0),
    })),
    models: [...models.values()].sort(byTokens),
    recordCount,
    startDate: daily[0].date,
    endDate: daily[daily.length - 1].date,
  };
}
