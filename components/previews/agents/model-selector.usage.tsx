"use client";

import { ModelSelector } from "@/components/agents/model-selector";

const models = [
  {
    value: "default",
    label: "Default",
    description: "Recommended set of models",
  },
  { value: "gpt-6-astra", label: "GPT-6 Astra" },
  { value: "gpt-6-sol", label: "GPT-6 Sol" },
  { value: "gpt-6-luna", label: "GPT-6 Luna" },
  { value: "gpt-5.6-sol", label: "GPT-5.6 Sol" },
  { value: "gpt-5.6-terra", label: "GPT-5.6 Terra" },
  { value: "gpt-5.6-luna", label: "GPT-5.6 Luna" },
  { value: "gpt-5.5", label: "GPT-5.5" },
];

export function ModelSelectorUsage() {
  return <ModelSelector models={models} defaultValue="gpt-5.6-sol" />;
}
