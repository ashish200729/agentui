import { SITE_URL } from "@/lib/site";

const guides = {
  "motion-patterns": {
    title: "Motion Guides",
    description:
      "Practical guidance for purposeful animation, timing, easing, springs, and accessible motion in React interfaces.",
    body: `## Decision framework

Ask four questions before choosing a duration or spring:

1. **Check frequency.** Repeated actions should feel nearly instant. Save expressive motion for rare moments.
2. **Name the purpose.** Motion should explain space, confirm input, show state, or soften a change.
3. **Choose the physics.** Use ease-out for entrances, ease-in-out for movement, linear motion for progress, and springs for gestures.
4. **Design the fallback.** Reduced motion should keep useful opacity and color feedback while removing travel, scale, parallax, and overshoot.

## Motion tokens

- \`EASE_OUT\`: entrances and exits that respond immediately, then settle quietly.
- \`EASE_IN_OUT\`: objects already on screen moving between positions.
- \`SPRING_PRESS\`: fast, weighted feedback for pressable surfaces.
- \`SPRING_LAYOUT\`: shared surfaces and indicators that preserve spatial continuity.

## Timing

| Interaction | Range | Desired feel |
| --- | --- | --- |
| Press feedback | 100–160ms | Immediate and physical |
| Tooltip or popover | 125–200ms | Quick and origin-aware |
| Dropdown or select | 150–250ms | Responsive, with no waiting |
| Modal or drawer | 200–500ms | Enough time to explain space |
| Marketing demo | Flexible | Clarity matters more than speed |

Under 300ms is the default for interface motion. Longer motion belongs to explanatory demos, deliberate gestures, and large spatial changes.

## Recipes

### Press feedback

Confirm input before the action finishes. Keep the scale change small and the response immediate.

\`\`\`tsx
const reduce = useReducedMotion();

<motion.button
  whileTap={reduce ? undefined : { scale: 0.97 }}
  transition={SPRING_PRESS}
>
  Continue
</motion.button>
\`\`\`

### Semantic icon motion

Let an icon imitate its real action. Gate decorative hover motion behind pointer capability and reduced-motion preferences.

### Content reveal

Reveal one meaningful surface with a short lift and restrained blur. Finish before the surface becomes the focus.

### Layout continuity

Keep the same surface visible while its footprint changes. Move the shape first, then introduce its label.

### Content swap

For small view changes, let old content leave faster than new content arrives. Keep travel to a few pixels.

## Accessibility

Reduced motion is a designed state. Preserve opacity, color, and instant state changes. Remove parallax, large transforms, repeated scale, and spring overshoot.

\`\`\`tsx
const reduce = useReducedMotion();

const hidden = {
  opacity: 0,
  transform: reduce ? "none" : "translateY(8px)",
};

const visible = {
  opacity: 1,
  transform: "translateY(0px)",
};
\`\`\``,
  },
  "ai-agents": {
    title: "Agent Guide",
    description:
      "Install the AgentUI agent skill, connect the MCP server, or consume the agent-friendly registry endpoints directly.",
    body: `## Agent skill

The skill at \`skills/agentui/SKILL.md\` teaches coding agents to choose existing AgentUI components before inventing custom motion widgets.

\`\`\`text
skills/agentui/SKILL.md
\`\`\`

## MCP server

Connect the hosted AgentUI MCP server at \`https://mcp.agentui.dev/mcp\`.

\`\`\`bash
# Claude Code
claude mcp add --transport http agentui https://mcp.agentui.dev/mcp

# Codex
codex mcp add agentui --url https://mcp.agentui.dev/mcp

# Amp
amp mcp add agentui https://mcp.agentui.dev/mcp
\`\`\`

Manual configuration:

\`\`\`json
{
  "mcpServers": {
    "agentui": {
      "type": "http",
      "url": "https://mcp.agentui.dev/mcp"
    }
  }
}
\`\`\`

Available tools: \`list_components\`, \`search_components\`, \`get_component\`, and \`get_install_command\`.

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| \`/llms.txt\` | Markdown discovery index |
| \`/r\` | JSON catalogue of every component |
| \`/r/{slug}\` | Component detail with files, dependencies, and source |
| \`/registry.json\` | shadcn directory-compatible catalogue |
| \`/r/{slug}.json\` | shadcn install item with inline file content |
| \`/r/{slug}/raw\` | Copy-ready plain-text source |
| \`/components/{category}/{slug}.md\` | Component documentation as Markdown |

## Agent flow

1. Fetch \`https://agentui.dev/r\` to discover components.
2. Select the closest item by its published name and description.
3. Fetch \`https://agentui.dev/r/{slug}\` for source, files, and dependencies.
4. Write every returned file to its declared path.
5. Install the external dependencies from the response.

## shadcn flow

\`\`\`bash
# Official registry namespace
npx shadcn@latest add @beui/message

# Direct registry URL
npx shadcn@latest add https://agentui.dev/r/message.json
\`\`\`

## Entry shape

Registry entries include the component slug, name, description, category, documentation URLs, package dependencies, internal helpers, and every source file required by the install.

## Generative UI

To let a model compose AgentUI components into a live interface, follow the [OpenUI integration guide](${SITE_URL}/docs/openui.md).`,
  },
  openui: {
    title: "Use AgentUI with OpenUI",
    description:
      "Register AgentUI components with OpenUI, generate the system prompt, stream OpenUI Lang, and render interactive UI.",
    body: `OpenUI lets a model emit an abstract UI tree instead of Markdown. Its React runtime maps every node to a component you register, so generated responses use only the AgentUI components you allow.

## Install

\`\`\`bash
npm install @openuidev/react-lang @openuidev/lang-core zod
npm install openai
npx shadcn@latest add @beui/message @beui/prompt-input @beui/agent-activity
\`\`\`

## Register components

Use \`defineComponent\` to map an OpenUI Lang node to an AgentUI component. The Zod schema validates streamed model output, while the description teaches the model when to use the component.

\`\`\`tsx
import { defineComponent, useTriggerAction } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { Message, MessageBubble, MessageBubbleContent } from "@/components/agents/message";

const AgentMessage = defineComponent({
  name: "Message",
  description: "A user or assistant message rendered in the conversation.",
  props: z.object({
    text: z.string(),
    from: z.enum(["user", "assistant"]).default("assistant"),
  }),
  component: ({ props }) => (
    <Message from={props.from}>
      <MessageBubble>
        <MessageBubbleContent>{props.text}</MessageBubbleContent>
      </MessageBubble>
    </Message>
  ),
});
\`\`\`

## Assemble the library

\`createLibrary\` collects the definitions, names the root node, and groups components with prompt guidance.

\`\`\`tsx
import { createLibrary } from "@openuidev/react-lang";

export const agentuiLibrary = createLibrary({
  root: "Stack",
  components: [Stack, AgentMessage],
});
\`\`\`

## Generate the prompt

Generate a serializable library specification whenever the component library changes:

\`\`\`bash
npx @openuidev/cli@latest generate \\
  --spec ./lib/agentui-library.tsx \\
  --out ./lib/generated/agentui-library.spec.json
\`\`\`

Pass that specification to \`generateSystemPrompt\` in the server route, then stream the model's OpenUI Lang response to the browser.

## Render the stream

\`\`\`tsx
<Renderer
  response={response}
  library={agentuiLibrary}
  isStreaming={isStreaming}
  onAction={(event) => onSend(event.humanFriendlyMessage)}
/>
\`\`\`

## Why AgentUI fits

AgentUI components own their files and ship through a shadcn-compatible registry. Generated interfaces inherit the host application's semantic color tokens and use real React controls.

## Resources

- [OpenUI](https://www.openui.com)
- [Defining components](https://www.openui.com/docs/openui-lang/defining-components)
- [shadcn chat example](https://www.openui.com/docs/openui-lang/examples/shadcn-chat)`,
  },
} as const;

export type GuideSlug = keyof typeof guides;

export const GUIDE_SLUGS = Object.keys(guides) as GuideSlug[];

export function buildGuideMarkdown(slug: string) {
  const guide = guides[slug as GuideSlug];
  if (!guide) return null;

  const documentation = `${SITE_URL}/docs/${slug}`;
  const markdown = `${documentation}.md`;
  const lines = [
    "---",
    `title: ${JSON.stringify(guide.title)}`,
    `description: ${JSON.stringify(guide.description)}`,
    `documentation: ${JSON.stringify(documentation)}`,
    `markdown: ${JSON.stringify(markdown)}`,
    "---",
    "",
    `# ${guide.title}`,
    "",
    `> ${guide.description}`,
    "",
    guide.body,
    "",
  ];

  return lines.join("\n");
}
