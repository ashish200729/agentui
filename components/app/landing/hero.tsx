"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { EASE_OUT } from "@/lib/ease";
import { MovingGradientButton } from "@/components/app/moving-gradient-button";
import { PressLink } from "@/components/app/press-link";
import { TextReveal } from "@/components/motion/text-reveal";
import { PUBLIC_INSTALLABLE_COUNT } from "@/lib/registry";

const HEADLINE = ["Agent interface components", "for React and Next.js"];
const HEADLINE_WORDS = HEADLINE.reduce((n, l) => n + l.split(" ").length, 0);
const STAGGER = 0.09;
const START = 0.12;
const AGENTUI_CONTRACT = "0xe3A1C9B8ffe33436Dc2364D7B7C9645372c13922";
const AGENTUI_LAUNCHPAD = `https://www.ponsfamily.com/launchpad/${AGENTUI_CONTRACT}`;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const headlineEnd = START + HEADLINE_WORDS * STAGGER;
  const subDelay = headlineEnd + 0.05;
  const ctaDelay = subDelay + 0.25;

  return (
    <div className="mx-auto max-w-7xl text-center">
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.05 }}
        className="flex justify-center"
      >
        <PressLink
          href="/components/agents"
          className="group mb-7 inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {PUBLIC_INSTALLABLE_COUNT} components · Tailwind 4 + React 19
          <ArrowUpRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </PressLink>
      </motion.div>

      <TextReveal
        as="h1"
        text={HEADLINE}
        delay={START}
        stagger={STAGGER}
        className="mx-auto font-display text-5xl font-semibold leading-[0.92] tracking-tight text-foreground sm:text-6xl md:text-7xl"
      />

      <p className="mx-auto mt-6 max-w-md text-pretty text-base leading-7 text-muted-foreground">
        Copy-paste AI agent components built with Motion and Tailwind CSS.
        Fully customizable and production-ready.
      </p>

      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: ctaDelay }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <MovingGradientButton
          href="/components/agents"
        >
          Explore components
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </MovingGradientButton>
        <PressLink
          href={AGENTUI_LAUNCHPAD}
          target="_blank"
          rel="noopener noreferrer"
          title={`CA: ${AGENTUI_CONTRACT}`}
          aria-label={`View $AGENTUI contract ${AGENTUI_CONTRACT} on Pons`}
          className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-border bg-card py-1.5 pl-2 pr-3 text-left text-foreground outline-none transition-colors duration-150 hover:border-border-strong hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src="/pons-logo.webp"
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-xl object-cover"
          />
          <span className="flex flex-col items-start gap-1 leading-none">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              $AGENTUI is live
            </span>
            <span className="text-[0.625rem] text-muted-foreground">
              Pons launchpad · CA 0xe3A1…13922
            </span>
          </span>
          <ArrowUpRight
            className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </PressLink>
      </motion.div>
    </div>
  );
}
