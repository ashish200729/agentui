# Product

<!-- impeccable:product-schema 1 -->
<!-- Product truth inferred from the repository and the user's 2026-08-24 agents-catalogue brief. -->

## Platform

web

## Users

React and Next.js developers evaluating and assembling interfaces for AI agents. They need to understand what each component does, inspect a credible preview, and reach its documentation or install source quickly.

## Product Purpose

AgentUI is a component library for agent conversations, reasoning, progress, tools, evidence, and human decisions. Success means a developer can discover the right primitive, verify its behavior, and copy or install source they can own and adapt.

## Positioning

AgentUI distributes production-focused agent-interface source through shadcn-compatible registry endpoints instead of hiding the implementation behind a runtime package.

## Operating Context

Developers browse the documentation catalogue, open live previews and API guidance, and install selected files into an existing React or Next.js project. The public catalogue currently focuses on agent components.

## Capabilities and Constraints

- Next.js App Router, React 19, Tailwind CSS 4, Motion, TypeScript, and Bun.
- Public component routes and registry slugs must remain stable.
- Components inherit semantic theme tokens and support light and dark themes.
- Motion must respect reduced-motion preferences; decorative hover behavior must not target touch devices.
- Registry entries must bundle every required source file and dependency.
- The agents catalogue must remain responsive and useful without relying on animation.

## Brand Commitments

- Product name: AgentUI.
- Canonical site: `agentui.pro`.
- Voice: clear, direct, technical, and free of inflated claims.
- The interface must feel original to AgentUI and must not reproduce beUI's catalogue composition or card treatment.
- The requested catalogue direction is clean, simple, component-led, and production-ready.

## Evidence on Hand

- Seventeen public agent components with working detail pages and registry items.
- Real interactive previews under `components/previews/agents/`.
- Automated registry, accessibility, interaction, responsive, and production-contract tests.
- No approved customer logos, usage metrics, testimonials, or comparative performance claims for this surface.

## Product Principles

1. Demonstrate behavior before describing implementation.
2. Make component discovery faster than scanning a generic card wall.
3. Keep installation and ownership transparent.
4. Use motion to explain state change, never to decorate waiting.
5. Preserve semantic controls, keyboard access, and responsive clarity.

## Accessibility & Inclusion

Interactive surfaces use semantic HTML, visible keyboard focus, sufficient contrast, touch-safe behavior, and reduced-motion fallbacks. The catalogue must preserve readable content and navigation when animation is disabled.
