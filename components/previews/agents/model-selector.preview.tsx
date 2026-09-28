"use client";

import { ArrowUp, Mic, Paperclip } from "lucide-react";
import { useState } from "react";
import {
  ModelSelector,
  type ModelSelectorOption,
} from "@/components/agents/model-selector";

const MODELS: ModelSelectorOption[] = [
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

export function ModelSelectorPreview() {
  const [model, setModel] = useState("gpt-5.6-sol");

  return (
    <div className="flex h-[360px] w-full max-w-xl items-end justify-center px-3 pb-5">
      <div className="w-full rounded-[22px] border border-border bg-background p-2.5 transition-colors focus-within:border-border-strong">
        <div className="min-h-24 px-2 py-1.5 text-sm leading-6 text-foreground">
          Review this interface and make the interaction feel production-ready.
        </div>

        <div className="flex min-h-8 items-center gap-1">
          <button
            type="button"
            aria-label="Attach a file"
            className="grid size-8 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Paperclip className="size-4" />
          </button>

          <ModelSelector
            models={MODELS}
            value={model}
            onValueChange={setModel}
          />

          <button
            type="button"
            aria-label="Use voice input"
            className="ml-auto grid size-8 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mic className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Send prompt"
            className="grid size-8 place-items-center rounded-full bg-foreground text-background outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
