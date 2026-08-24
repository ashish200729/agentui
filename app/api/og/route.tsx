import { ImageResponse } from "next/og";
import { getOgAssets } from "@/lib/og-assets";
import { getOgFonts } from "@/lib/og-fonts";
import { findPublicCategory, publicAllComponents } from "@/lib/registry";
import { OG_SIZE, ogImage } from "@/lib/og";
import { clampText } from "@/lib/seo";
import { registryItemUrl } from "@/lib/site";

// The card art has room for roughly this much body text before it overflows.
const OG_DESCRIPTION_LIMIT = 120;

export const runtime = "edge";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const componentSlug = searchParams.get("component");
  const categorySlug = searchParams.get("category");
  const component = componentSlug
    ? publicAllComponents().find((item) => item.slug === componentSlug)
    : undefined;
  const category =
    component?.category ??
    (categorySlug ? findPublicCategory(categorySlug) : undefined);
  const title =
    component?.name ??
    category?.name ??
    "AI agent components for React and Next.js";
  const description = clampText(
    component?.description ??
      category?.description ??
      "React components for AI agent interfaces, built with Motion and Tailwind CSS.",
    OG_DESCRIPTION_LIMIT,
  );
  const label = component
    ? "Component"
    : category
      ? category.name
      : "Agent components";
  const command = component
    ? `npx shadcn add ${registryItemUrl(component.slug)}`
    : `npx shadcn add ${registryItemUrl("...")}`;
  const origin = requestUrl.origin;
  const [fonts, assets] = await Promise.all([
    getOgFonts(origin),
    getOgAssets(origin),
  ]);

  return new ImageResponse(
    ogImage({ title, description, label, command, ...assets }),
    { ...OG_SIZE, fonts },
  );
}
