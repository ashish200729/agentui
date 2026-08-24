<p align="center">
  <a href="https://www.agentui.pro">
    <img src="./public/agentui-mark.svg" alt="AgentUI logo" width="88" height="88" />
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
  <a href="https://www.agentui.pro">Website</a>
  ·
  <a href="https://www.agentui.pro/components/agents">Agent components</a>
  ·
  <a href="https://www.agentui.pro/llms.txt">llms.txt</a>
</p>

<p align="center">
  <a href="https://www.agentui.pro"><img src="./public/demo.gif" alt="AgentUI components demo" width="640" /></a>
</p>

## What is AgentUI?

AgentUI is a small component library for product interfaces.

Each component includes a live preview, usage example, source code, and a shadcn install command. The components are meant to live in your app, not behind a package.

## Install a component

Open any component page and copy the direct install command:

```bash
npx shadcn@latest add https://www.agentui.pro/r/message.json
```

The planned `@agentui` namespace can be configured today in your project's `components.json`:

```json
{
  "registries": {
    "@agentui": "https://www.agentui.pro/r/{name}.json"
  }
}
```

After that, `npx shadcn@latest add @agentui/message` works. Direct URLs remain the zero-configuration path until the namespace is accepted into shadcn's public registry directory. You can also copy the source directly from the component page.

## For AI agents

AgentUI exposes static endpoints that coding agents can read without scraping the UI.

```txt
https://www.agentui.pro/llms.txt
https://www.agentui.pro/r
https://www.agentui.pro/r/{slug}
https://www.agentui.pro/r/{slug}.json
https://www.agentui.pro/r/{slug}/raw
```

The agent skill is included at [`skills/agentui/SKILL.md`](./skills/agentui/SKILL.md). It helps Cursor, Claude Code, Codex, and other coding agents choose existing `@agentui` components before inventing new motion UI.

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
