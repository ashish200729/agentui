import type { Metadata } from "next";
import Link from "next/link";
import { FeaturedDocsSponsor } from "@/components/app/sponsors/featured-docs-sponsor";
import { SponsorContactActions } from "@/components/app/sponsors/sponsor-contact-actions";
import { SPONSORSHIP_PRICE } from "@/lib/sponsorship";

const description =
  `One featured AgentUI sponsorship placement across public component documentation pages, available for ${SPONSORSHIP_PRICE} per month.`;

export const metadata: Metadata = {
  title: "Sponsor AgentUI",
  description,
  alternates: { canonical: "/sponsors" },
  openGraph: {
    title: "Sponsor AgentUI",
    description,
    url: "/sponsors",
    type: "website",
    siteName: "AgentUI",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsor AgentUI",
    description,
    images: ["/api/og"],
  },
};

export default function SponsorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-12 sm:px-6 lg:px-8 lg:pt-24">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-x-20 lg:gap-y-12">
        <div className="min-w-0">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl">
            Put your brand beside the work.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Sponsor AgentUI with one featured placement across its public
            component pages. Your brand appears alongside the documentation
            developers use to explore and install components.
          </p>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-2 border-t border-border pt-6">
            <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">
              {SPONSORSHIP_PRICE}
            </span>
            <span className="text-sm text-muted-foreground">per month</span>
          </div>
        </div>

        <aside
          aria-label="Sponsorship preview"
          className="lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <FeaturedDocsSponsor />
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Preview shown with AgentUI branding. Your approved creative replaces it.
          </p>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <section aria-labelledby="placement-heading">
            <h2 id="placement-heading" className="text-xl font-semibold tracking-tight text-foreground">
              What the placement includes
            </h2>
            <dl className="mt-5 divide-y divide-border border-y border-border text-sm">
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                <dt className="font-medium text-foreground">Where</dt>
                <dd className="text-muted-foreground">
                  In the right rail of every public component page on desktop,
                  and after the documentation on smaller screens.
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                <dt className="font-medium text-foreground">Your creative</dt>
                <dd className="text-muted-foreground">
                  Your logo, brand name, short description, and a link to your site.
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                <dt className="font-medium text-foreground">Before launch</dt>
                <dd className="text-muted-foreground">
                  We agree on fit, artwork, start date, and payment by email.
                </dd>
              </div>
            </dl>
          </section>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="#contact"
              className="inline-flex min-h-11 items-center gap-3 rounded-lg border border-border-strong bg-card px-4 text-sm font-medium text-foreground outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              Discuss sponsorship
            </a>
            <Link
              href="/components/agents/message-scroller"
              className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-4 outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              See it on a component page
            </Link>
          </div>
        </div>

      </div>
      <section
        id="contact"
        aria-labelledby="sponsor-contact-heading"
        className="mt-20 scroll-mt-24 border-t border-border pt-10"
      >
        <h2 id="sponsor-contact-heading" className="text-2xl font-semibold tracking-tight text-foreground">
          Start a sponsorship
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Tell us about your brand and where the placement should link. We’ll
          confirm the details before anything goes live.
        </p>
        <SponsorContactActions />
      </section>
    </div>
  );
}
