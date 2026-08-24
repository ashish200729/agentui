---
version: 1
slug: "app-components-category-page-tsx"
primary_target: "app/components/[category]/page.tsx"
related_targets: ["components/app/docs/agent-catalog-hero.tsx","components/app/docs/agent-catalog-card.tsx"]
---

Scope: `/components/agents` catalogue route. Visitor mode: Read.

Audience and job: React and Next.js developers need to scan the complete public agent-component set, recognize each primitive from its real preview and concise capability label, and open the relevant detail page.

Primary action: browse one compact component grid and choose a component.

Proof and content: the seventeen real public components, their registry-backed names and descriptions, stable documentation routes, and the source-included theme-safe product facts.

Constraints: preserve the shared AgentUI header, theme system, component routes, and registry behavior. The catalogue sidebar contains only Home and the public AI Agent component list. The shared dock contains only Home, Components, and Theme. Neither surface repeats Agent Guide or OpenUI links. Keep the hero quiet and single-column. Do not show an agent-run demo, category groups, category navigation, card descriptions, registry JSON paths, unavailable services, or fabricated claims on this route. Cards are compact responsive squares that show only inert real previews; concise capability labels appear on hover and keyboard focus, and remain visible on touch devices. Every card remains one semantic link with visible focus.

Direction: a quiet agent directory. A generous first viewport states the scope, then transitions directly into one dense grid containing every public agent component. Cards are preview-only until a short functional label rises into view on hover or focus. The memorable moment is the shift from open space to a compact wall of working interface specimens.

Unresolved decisions: the future public `@agentui` namespace and non-agent catalogue categories are outside this surface.
