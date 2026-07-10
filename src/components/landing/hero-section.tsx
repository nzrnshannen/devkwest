"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Kanban,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Sparkles,
    title: "Smart Project Generator",
    description:
      "Roll the dice and get tailored coding challenges matched to your stack.",
  },
  {
    icon: Kanban,
    title: "Kanban Progress Board",
    description:
      "Track every project from idea to deployment with drag-and-drop columns.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Analytics",
    description:
      "Measure completion rates, language breakdowns, and build momentum over time.",
  },
];

export function HeroSection({ rippleFilterId }: { rippleFilterId?: string }) {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  const rippleStyle = rippleFilterId
    ? { filter: `url(#${rippleFilterId})` }
    : undefined;

  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-dot-white opacity-40"
        style={rippleStyle}
      />
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px] animate-pulse-glow"
        style={rippleStyle}
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Terminal className="h-3.5 w-3.5" />
            Built for developers who ship
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-glow">
            Dev<span className="text-primary">Kwest</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Start making personal projects and track progress!
          </p>

          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground/80">
            The high-end productivity tool for developers to build portfolios,
            stay accountable, and turn side projects into career milestones.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/register">
              <Button size="lg" className="min-w-[200px] box-glow">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="min-w-[200px]"
              aria-label="Explore features section"
              onClick={scrollToFeatures}
            >
              Explore Features
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          id="features"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-24 scroll-mt-28 grid gap-6 sm:grid-cols-3"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm hover:border-primary/30 hover:bg-card transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* Terminal preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 mx-auto max-w-3xl"
        >
          <div className="rounded-xl border border-border bg-card overflow-hidden box-glow">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">
                devkwest — project tracker
              </span>
            </div>
            <div className="p-6 font-mono text-sm space-y-2">
              <p>
                <span className="text-primary">$</span>{" "}
                <span className="text-muted-foreground">devkwest roll</span>
              </p>
              <p className="text-muted-foreground pl-4">
                → Career: Full-Stack Developer
              </p>
              <p className="text-muted-foreground pl-4">
                → Stack: TypeScript + Next.js
              </p>
              <p className="text-muted-foreground pl-4">
                → Project: Subscription Billing Platform
              </p>
              <p className="text-muted-foreground pl-4">
                → Deadline: 1 week
              </p>
              <p className="pt-2">
                <span className="text-primary">$</span>{" "}
                <span className="text-accent">Project added to board ✓</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
