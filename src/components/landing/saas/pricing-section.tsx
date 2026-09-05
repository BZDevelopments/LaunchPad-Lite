"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground">Start free. Upgrade when you need it.</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Lite Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-6">
              <h3 className="mb-1 text-lg font-bold text-foreground">Starter</h3>
              <p className="text-sm text-muted-foreground">Perfect for trying things out.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">Free</span>
            </div>
            <ul className="mb-8 flex-1 space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">Next.js 15 App Router</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">Better Auth Setup</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">Drizzle ORM & Postgres</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full rounded-xl border border-border bg-card py-3 text-center text-sm font-semibold text-foreground hover:bg-muted"
            >
              Get Started
            </Link>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative flex flex-col rounded-2xl border border-primary bg-primary/5 p-6 shadow-lg shadow-primary/10"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-md">Recommended</span>
            </div>
            <div className="mb-6">
              <h3 className="mb-1 text-lg font-bold text-foreground">Pro</h3>
              <p className="text-sm text-muted-foreground">For serious builders.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">$64.99</span>
              <span className="text-muted-foreground"> one-time</span>
            </div>
            <ul className="mb-8 flex-1 space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">6 Layout Types (Ecomm, Agency, etc.)</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">Stripe & LemonSqueezy</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">AI SDK v5 (Chat, RAG, Image Gen)</span>
              </li>
            </ul>
            <a
              href="https://launchpad-checkout.netlify.app/"
              className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 hover:opacity-90"
            >
              Get Launchpad Pro
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
