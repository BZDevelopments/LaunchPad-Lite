"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/user-control/site-config";

export function SaasHero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.62 0.19 45 / 0.14), transparent)" }}
      />
      <div className="mx-auto max-w-4xl text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6 inline-flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            Open source · MIT License
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {siteConfig.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground"
        >
          Next.js 15, Better Auth, Drizzle ORM — pre-wired so you can skip straight to building your product.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:-translate-y-0.5"
          >
            Start building free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="https://github.com/BZDevelopments/launchpad-lite"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted"
          >
            View on GitHub
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          Need payments, AI, or more layouts?{" "}
          <a href="https://launchpad-checkout.netlify.app/" className="text-primary underline underline-offset-2 hover:opacity-80">
            Get Launchpad Pro →
          </a>
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-auto mt-20 max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-2 text-xs font-mono text-muted-foreground">terminal</span>
        </div>
        <div className="p-6 font-mono text-sm space-y-2">
          <p><span className="text-primary">$</span> <span className="text-foreground">git clone https://github.com/BZDevelopments/launchpad-lite</span></p>
          <p><span className="text-primary">$</span> <span className="text-foreground">cp .env.example .env.local</span></p>
          <p><span className="text-primary">$</span> <span className="text-foreground">npm run db:push && npm run dev</span></p>
          <p className="text-green-500 animate-pulse">▶ Ready at http://localhost:3000</p>
        </div>
      </motion.div>
    </section>
  );
}
