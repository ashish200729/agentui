<p align="center">
  <a href="https://agentui.dev">
    <img src="./public/agentui-mark.png" alt="AgentUI logo" width="88" height="88" />
  </a>
</p>

<h1 align="center">AgentUI</h1>

<p align="center">
  AI agent components for React and Next.js. Copy the source, own the code.
</p>

<p align="center">
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-000000?style=flat-square" /></a>
  <a href="https://ui.shadcn.com/docs/registry"><img alt="shadcn compatible" src="https://img.shields.io/badge/shadcn-compatible-000000?style=flat-square" /></a>
</p>

<p align="center">
  <a href="https://agentui.dev">Website</a>
  ·
  <a href="https://agentui.dev/components/agents">Agent components</a>
  ·
  <a href="https://agentui.dev/llms.txt">llms.txt</a>
</p>

<p align="center">
  <a href="https://agentui.dev"><img src="./public/demo.gif" alt="AgentUI components demo" width="640" /></a>
</p>

## What is AgentUI?

AgentUI is a small component library for product interfaces.

Each component includes a live preview, usage example, source code, and a shadcn install command. The components are meant to live in your app, not behind a package.

### Need complete blocks and landing pages?

[AgentUI Pro](https://pro.agentui.dev/) includes premium animated sections and full Next.js templates with editable source and private registry access.

## Install a component

Open any component page and copy the install command. AgentUI is in the shadcn registry directory under the existing `@beui` compatibility namespace.

```bash
npx shadcn@latest add @beui/message
```

Direct URLs also work:

```bash
npx shadcn@latest add https://agentui.dev/r/animated-toast-stack.json
```

You can also copy the source directly from the component page.

## For AI agents

AgentUI exposes static endpoints that coding agents can read without scraping the UI.

```txt
https://agentui.dev/llms.txt
https://agentui.dev/r
https://agentui.dev/r/{slug}
https://agentui.dev/r/{slug}.json
https://agentui.dev/r/{slug}/raw
```

The agent skill is included at [`skills/agentui/SKILL.md`](./skills/agentui/SKILL.md). It helps Cursor, Claude Code, Codex, and other coding agents choose existing `@beui` components before inventing new motion UI.

## Run locally

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
bun run check
```

This runs TypeScript, Biome lint, and registry source validation.

## Contributing

Add agent components in `components/agents/`, previews in `components/previews/agents/`, and registry entries in `lib/registry.ts`.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before contributing.

## License

AgentUI is available under the [MIT License](./LICENSE).
