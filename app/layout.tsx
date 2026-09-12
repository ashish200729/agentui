import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/app/analytics/google-analytics";
import { ThemeProvider } from "@/components/app/chrome/theme-provider";
import { PreferencesProvider } from "@/components/app/preferences/preferences-provider";
import { PreferencesPanel } from "@/components/app/preferences/preferences-panel";
import { SiteHeader } from "@/components/app/chrome/site-header";
import { SiteDock } from "@/components/app/chrome/site-dock";
import { SiteFrame } from "@/components/app/chrome/site-frame";
import { KeyboardShortcuts } from "@/components/app/chrome/keyboard-shortcuts";
import { JsonLd } from "@/components/app/analytics/json-ld";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  siteJsonLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_TITLE} · ${SITE_NAME}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  publisher: SITE_NAME,
  category: "technology",
  formatDetection: { telephone: false, email: false, address: false },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    types: {
      "application/json": "/registry.json",
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    title: `${SITE_TITLE} · ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: `${SITE_TITLE} · ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_TITLE} · ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    images: ["/api/og"],
  },
  keywords: [
    "AI agent components",
    "best AI agent components",
    "React agent components",
    "Tailwind CSS components",
    "Next.js components",
    "shadcn registry",
    "shadcn-compatible components",
    "streaming chat components",
    "AI reasoning UI",
    "agent tool activity UI",
    "human in the loop components",
    "animated UI components",
    "component library",
    "copy paste components",
    "AgentUI",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(sans.variable, mono.variable)}
    >
      <head>
        {process.env.NODE_ENV === "production" && (
          <script
            defer
            src="https://collect.tracwell.app/script.js"
            data-project-key="tw_live_b83ebcb2a50b4e3b82f65ca32c086623"
            data-collection-mode="private"
            data-consent="granted"
            data-respect-do-not-track="true"
          />
        )}
        <link rel="icon" type="image/svg+xml" href="/agentui-mark.svg" />
        <link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt" />
        <link rel="alternate" type="application/json" title="Component registry" href="/r" />
        <link rel="alternate" type="application/json" title="shadcn registry" href="/registry.json" />
      </head>
      <body className="min-h-screen antialiased">
        <JsonLd data={siteJsonLd()} />
        <ThemeProvider>
          <PreferencesProvider>
            <KeyboardShortcuts />
            <SiteHeader />
            <main className="pt-14 pb-32">
              <SiteFrame>{children}</SiteFrame>
            </main>
            <SiteDock />
            <PreferencesPanel />
            {process.env.NODE_ENV === "production" && <Analytics />}
            {process.env.NODE_ENV === "production" && <SpeedInsights />}
            <GoogleAnalytics measurementId={googleAnalyticsId} />
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
