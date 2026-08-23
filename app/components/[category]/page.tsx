import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPublicCategory, publicRegistry } from "@/lib/registry";
import { ComponentCard } from "@/components/app/docs/component-card";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { isComponentNew } from "@/lib/component-status";
import { breadcrumbJsonLd, categoryJsonLd } from "@/lib/seo";

const categoryContent = {
  agents: {
    title: "AI Agent Components — Animated React AI Interfaces",
    heading: "Animated AI agent components",
    description:
      "Build clear, responsive AI experiences with open-source React components for agent reasoning, progress, tool activity, and conversation states.",
    allLabel: "All agent components",
  },
} as const;

const AGENT_CATEGORY_GROUPS = [
  {
    id: "workspace",
    title: "Workspace and navigation components",
    description:
      "Build the complete agent workspace shell, then organize projects, conversations, files, and bookmarks in a responsive navigation surface.",
    slugs: ["chat-app", "ai-sidebar"],
  },
  {
    id: "conversation",
    title: "Conversation components",
    description:
      "Compose prompts, arrange sender-aware messages, shape conversational surfaces, and keep streamed turns stable while the reader moves through the transcript.",
    slugs: ["prompt-input", "message", "message-bubble", "message-scroller"],
  },
  {
    id: "responses",
    title: "Response and evidence components",
    description:
      "Render rich answers as they arrive, reveal completion actions at the right time, and connect generated claims to inspectable sources.",
    slugs: ["streaming-response", "image-generation", "citations"],
  },
  {
    id: "progress",
    title: "Progress and planning components",
    description:
      "Communicate unknown waits, durable task plans, and chronological agent activity without inventing precision or exposing an unfiltered trace.",
    slugs: ["loading-states", "todo-list", "agent-activity"],
  },
  {
    id: "tools",
    title: "Tool and code components",
    description:
      "Present execution outcomes, generated source, and file changes with bounded streaming, stable highlighting, and inspectable completion states.",
    slugs: ["tool-result", "code-block", "file-diff"],
  },
  {
    id: "human-control",
    title: "Human-in-the-loop components",
    description:
      "Pause agent work for a scoped permission, clarification, review, or decision, then preserve the resolved outcome in the run history.",
    slugs: ["tool-approval", "approval-card"],
  },
] as const;

export function generateStaticParams() {
  return publicRegistry.map((c) => ({ category: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = findPublicCategory(category);
  if (!cat) return {};

  const content =
    categoryContent[cat.slug as keyof typeof categoryContent];
  const title = content.title;
  const ogTitle = `${title} · AgentUI`;
  const pageUrl = `/components/${cat.slug}`;
  const imageUrl = `/api/og?category=${cat.slug}`;
  const componentNames = cat.components.map((comp) => comp.name);

  return {
    title,
    description: content.description,
    keywords: [
      `${cat.name} components`,
      "AI agent components",
      "best AI agent components",
      "free AI agent components",
      "open source AI agent components",
      "streaming chat components",
      "agent tool activity UI",
      "Tailwind CSS components",
      "shadcn-compatible components",
      "shadcn registry",
      "AgentUI",
      ...componentNames,
    ],
    openGraph: {
      title: ogTitle,
      description: content.description,
      url: pageUrl,
      type: "website",
      siteName: "AgentUI",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${cat.name} components by AgentUI`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: content.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: pageUrl,
      types: {
        "application/json": "/registry.json",
      },
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = findPublicCategory(category);
  if (!cat) notFound();
  const content =
    categoryContent[cat.slug as keyof typeof categoryContent];
  const now = Date.now();
  const newComponents = cat.components.filter((comp) =>
    isComponentNew(comp, now),
  );
  const components = cat.components.filter(
    (comp) => !isComponentNew(comp, now),
  );
  const agentGroups =
    cat.slug === "agents"
      ? AGENT_CATEGORY_GROUPS.map((group) => ({
          ...group,
          components: group.slugs.flatMap((slug) => {
            const component = cat.components.find((item) => item.slug === slug);
            return component ? [component] : [];
          }),
        }))
      : [];

  return (
    <div>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "AgentUI", path: "/" },
            { name: cat.name, path: `/components/${cat.slug}` },
          ]),
          categoryJsonLd(cat),
        ]}
      />
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm"
      >
        <span className="font-medium text-foreground">{cat.name}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground">
        {content.heading}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        {content.description}
      </p>

      {agentGroups.length ? (
        <div className="mt-12 space-y-14">
          {agentGroups.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-24">
              <div className="max-w-2xl">
                <h2 className="text-xl font-medium tracking-tight text-foreground">
                  {group.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {group.description}
                </p>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {group.components.map((comp) => (
                  <ComponentCard
                    key={comp.slug}
                    categorySlug={cat.slug}
                    slug={comp.slug}
                    name={comp.name}
                    description={comp.description}
                    badge={comp.badge}
                    launchedAt={comp.launchedAt}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <>
          {newComponents.length ? (
            <section className="mt-10">
              <h2 className="font-display text-xs font-medium uppercase text-muted-foreground">
                New
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {newComponents.map((comp) => (
                  <ComponentCard
                    key={comp.slug}
                    categorySlug={cat.slug}
                    slug={comp.slug}
                    name={comp.name}
                    description={comp.description}
                    badge={comp.badge}
                    launchedAt={comp.launchedAt}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="font-display text-xs font-medium uppercase text-muted-foreground">
              {content.allLabel}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {components.map((comp) => (
                <ComponentCard
                  key={comp.slug}
                  categorySlug={cat.slug}
                  slug={comp.slug}
                  name={comp.name}
                  description={comp.description}
                  badge={comp.badge}
                  launchedAt={comp.launchedAt}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
