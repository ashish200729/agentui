"use client";

import { UsageDashboardUsage } from "./usage-dashboard-example";

export function UsageDashboardPreview() {
  return (
    <div className="w-full max-w-[920px]">
      <p className="mb-3 text-right text-xs text-muted-foreground">Illustrative data · not live usage</p>
      <UsageDashboardUsage />
    </div>
  );
}
