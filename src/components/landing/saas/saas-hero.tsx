"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { siteConfig } from "@/user-control/site-config";
import { themeConfig } from "@/user-control/theme-config";

export function SaasHero() {
  const { fadeUp, staggerChildren } = themeConfig.animations;

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.62 0.19 45 / 0.14), transparent)" }}
      />
      <motion.div className="mx-auto max-w-4xl text-center" variants={staggerChildren} initial="initial" animate="animate">
        <motion.div variants={fadeUp} className="mb-6 inline-flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            {siteConfig.tagline}
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ship your product,{" "}
          <span className="italic text-primary">not your plumbing</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {siteConfig.description}
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:-translate-y-0.5"
          >
            Start building for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/#features"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted"
          >
            See what's included
          </Link>
        </motion.div>

        <motion.p variants={fadeUp} className="mt-8 text-sm text-muted-foreground">
          No credit card required · Deploy in minutes
        </motion.p>
      </motion.div>

      <motion.div variants={fadeUp} className="mx-auto mt-20 max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-2 text-xs font-mono text-muted-foreground">terminal</span>
        </div>
        <div className="p-6 font-mono text-sm">
          <div className="space-y-2">
            <p><span className="text-primary">$</span> <span className="text-foreground">npm install</span></p>
            <p className="text-muted-foreground">✓ Auth, billing, and AI wired up...</p>
            <p className="text-muted-foreground">✓ Configuring your dashboard...</p>
            <p className="text-green-500">✓ Ready! Edit site-config.ts to make it yours.</p>
            <p><span className="text-primary">$</span> <span className="text-foreground">npm run dev</span></p>
            <p className="text-green-500 animate-pulse">▶ Local: http://localhost:3000</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
