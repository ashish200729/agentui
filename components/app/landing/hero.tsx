"use client";

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
      </motion.div>
    </div>
  );
}
