"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            Ready to go further?
          </h2>
          <p className="mb-8 text-muted-foreground">
            LaunchPad Pro adds payments, AI, e-commerce, 5 more layouts, and everything else your product will eventually need.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="rounded-xl border border-border bg-card px-8 py-4 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Start with Lite — free
            </Link>
            <a
              href="https://launchpad-checkout.netlify.app/"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
            >
              Get Launchpad Pro
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
