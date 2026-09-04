"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkle } from "lucide-react";

const stats = [
  { value: "< 5 min", label: "Time to first deploy" },
  { value: "100%", label: "TypeScript coverage" },
  { value: "A+", label: "Security headers grade" },
  { value: "6", label: "Site types supported" },
];

export function SocialProofSection() {
  return (
    <section className="border-y border-border bg-muted/30 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center">
              <p className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 p-12 text-center shadow-xl shadow-primary/5">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
          <Sparkle className="h-6 w-6 text-primary" fill="currentColor" />
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>Ready to build something great?</h2>
        <p className="mb-8 text-muted-foreground">Start today. No boilerplate headaches, no wasted weekends.</p>
        <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:opacity-90 hover:-translate-y-0.5">
          Get started for free
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </section>
  );
}
