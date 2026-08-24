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
