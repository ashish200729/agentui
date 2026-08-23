"use client";

import {
  AgentActivity,
  type AgentActivityItem,
} from "@/components/agents/agent-activity";

const LANDING_ACTIVITY: AgentActivityItem[] = [
  {
    id: "separate",
    type: "text",
    content: "Separated the content model from the presentation.",
  },
  {
    id: "render",
    type: "text",
    content: "Kept each event in a compact, readable renderer.",
  },
  {
    id: "preserve",
    type: "text",
    content: "Preserved the full history while keeping the latest result in view.",
  },
];

/** Stable landing composition; full streaming behavior remains in the detail demos. */
export function AgentActivityLandingPreview() {
  return (
    <div className="w-full max-w-lg">
      <AgentActivity
        items={LANDING_ACTIVITY}
        contentType="text"
        status="complete"
        duration={9}
        defaultOpen
        collapseOnComplete={false}
        maxHeight={180}
      />
    </div>
  );
}
