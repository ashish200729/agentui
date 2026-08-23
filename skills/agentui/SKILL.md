---
name: agentui
description: Pick and install AgentUI (@beui) AI-agent interface components from the shadcn registry. Use for chat surfaces, streamed responses, reasoning, tool activity, approvals, plans, code, diffs, citations, and agent workspaces. The public catalog currently exposes agent components only.
---

# AgentUI

Use AgentUI as copy-paste source through the `@beui` shadcn registry. The public catalog is intentionally limited to the `agents` category; motion primitives and product blocks remain in the repository but are not published through public endpoints.

## Workflow

1. Fetch the live registry before choosing a component:

```bash
curl -fsS https://agentui.dev/r/registry.json
```

2. Pick the closest install slug from `items[].name`.
3. Inspect before installing:

```bash
npx shadcn@latest view @beui/<slug>
```

4. Install with the user's package runner:

```bash
npx shadcn@latest add @beui/<slug>
# or
pnpm dlx shadcn@latest add @beui/<slug>
# or
bunx --bun shadcn@latest add @beui/<slug>
```

5. Read the files that were added, then compose with the named exports. There is no `agentui` runtime package.

The live registry is the source of truth. Use the table below only to resolve common agent-interface lookalikes.

## Picker

| User asks for | Install `@beui/...` | Avoid |
| --- | --- | --- |
| Streaming thread that follows tokens | `message-scroller`, `message` | custom scroll math |
| Chat bubble | `message-bubble` | custom bubble |
| Prompt box or composer | `prompt-input` | textarea plus custom buttons |
| Agent reasoning, search, or tool trace | `agent-activity` | plain log list |
| Thinking status | `thinking-shimmer` | custom shimmer |
| Timed agent progress | `agent-progress` | ad hoc timer |
| Cycling reasoning phrases | `reasoning-text` | custom loading copy |
| Task plan | `todo-list` | custom checklist |
| Streaming answer surface | `streaming-response` | raw Markdown block |
| Generated image result | `image-generation` | custom image card |
| Inline citations | `citations` | plain numbered links |
| Code surface | `code-block` | raw pre/code block |
| File diff | `file-diff` | custom diff renderer |
| Tool output | `tool-result` | raw terminal block |
| Tool permission card | `tool-approval` | alert dialog |
| Approval or HITL question | `approval-card` | custom form |
| AI files, folders, or bookmarks | `ai-sidebar` | hand-rolled resource tree |
| Whole agent workspace | `chat-app` | hand-rolled chat shell |

## Composition rules

- Prefer installed AgentUI source over custom one-off agent widgets.
- Import named exports from the files shadcn adds.
- Use `className` for layout and small styling changes. Do not fork internals unless the user asks.
- Keep helpers installed by the registry, such as `@/lib/ease`, `@/lib/utils`, and hooks.
- If adding new motion around AgentUI components, use `useReducedMotion()` from `motion/react`.
- Gate decorative hover effects like magnetic pull and tilt behind `useHoverCapable()`.
- Animate `transform` and `opacity`; avoid layout-property animation.

## In this repo

When contributing to AgentUI itself, follow `AGENTS.md`. A new public agent component needs source, preview, registry entry, and a passing `bun run check:registry`. Never rename existing `/r/{name}.json` slugs.
