import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { AgentCatalogCard } from "@/components/app/docs/agent-catalog-card";
import { AgentCatalogHero } from "@/components/app/docs/agent-catalog-hero";
import { ComponentCard } from "@/components/app/docs/component-card";
import { isComponentNew } from "@/lib/component-status";
import { findPublicCategory, publicRegistry } from "@/lib/registry";
import { breadcrumbJsonLd, categoryJsonLd } from "@/lib/seo";

const categoryContent = {
  agents: {
    title: "AI Agent Components — Animated React AI Interfaces",
    heading: "Animated AI agent components",
    description:
      "Build clear, responsive AI experiences with React components for agent reasoning, progress, tool activity, and conversation states.",
    allLabel: "All agent components",
  },
} as const;

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
      "React AI agent components",
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
  const isAgentCategory = cat.slug === "agents";

  return (
    <div className="mx-auto max-w-7xl">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "AgentUI", path: "/" },
            { name: cat.name, path: `/components/${cat.slug}` },
          ]),
          categoryJsonLd(cat),
        ]}
      />
      {isAgentCategory ? (
        <>
          <AgentCatalogHero componentCount={cat.components.length} />
          <section id="all-components" className="scroll-mt-24 py-12 sm:py-16">
            <h2 className="sr-only">All agent components</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {cat.components.map((component) => (
                <AgentCatalogCard key={component.slug} component={component} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
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
