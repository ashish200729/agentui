# AgentUI MCP server

Remote [MCP](https://modelcontextprotocol.io) server for the AgentUI component registries, running on a Cloudflare Worker. It lets AI agents discover, inspect, and install both free AgentUI components and licensed AgentUI Pro blocks.

It owns no data — it reads the live `agentui.pro/r/*` registry endpoints at runtime (edge-cached), so new components appear without redeploying the worker.

## Connect

Add to your MCP client (Claude Desktop, Cursor, etc.):

```
https://mcp.agentui.pro/mcp
```

Streamable HTTP is recommended. An SSE endpoint (`/sse`) exists for legacy clients.

## Connect to AgentUI Pro

Paid users can connect to the authenticated Pro endpoint with the same license
key they use as `AGENTUI_PRO_TOKEN`:

```json
{
  "mcpServers": {
    "agentui-pro": {
      "url": "https://mcp.agentui.pro/pro/mcp",
      "headers": {
        "Authorization": "Bearer ${AGENTUI_PRO_TOKEN}"
      }
    }
  }
}
```

The Pro endpoint forwards the bearer header to the private registry for each
tool call. It does not accept tokens as tool arguments, include them in tool
results, or cache authenticated source responses.

## Tools

| tool | input | returns |
|---|---|---|
| `list_components` | `category?` | components (slug, name, category, description) |
| `search_components` | `query` | best-matching components |
| `get_component` | `slug` | description, dependencies, all source files, install command |
| `get_install_command` | `slug`, `packageManager?` | shadcn CLI command per package manager |

The Pro endpoint exposes the same four tool names against the installable
`@agentui-pro` catalog. `get_component` returns the licensed source files, while
`get_install_command` also returns the registry configuration required by the
shadcn CLI. Standalone templates that are not in the private shadcn index are
not exposed as installable components.

## Develop

```bash
bun install
bun run dev        # local worker at http://localhost:8787
bun run typecheck
```

## Deploy

```bash
bun run deploy
```

Requires `agentui.pro` on Cloudflare. Wrangler provisions the `mcp.agentui.pro` custom domain on first deploy (see `routes` in `wrangler.jsonc`). To point at a different registry, set the `REGISTRY_URL` var.
