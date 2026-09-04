"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/user-control/site-config";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { FeaturesSection } from "@/components/landing/saas/features-section";
import { SocialProofSection } from "@/components/landing/saas/social-proof";

export function MarketingHome() {
  return (
    <div>
      <section className="relative overflow-hidden px-6 py-28 md:py-40 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.62 0.19 45 / 0.14), transparent)" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
            {siteConfig.tagline}
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground md:text-xl">{siteConfig.description}</p>
          <WaitlistForm />
        </motion.div>
      </section>

      <FeaturesSection />
      <SocialProofSection />
    </div>
  );
}
