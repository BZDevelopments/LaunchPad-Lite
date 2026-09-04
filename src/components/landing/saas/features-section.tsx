"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Brain, CreditCard, Database, Lock, Globe, Code2 } from "lucide-react";

const features = [
  { icon: Brain, title: "AI-Native", description: "Streaming chat, image generation, and RAG — pre-wired for OpenAI, Anthropic, and Google. Fully optional." },
  { icon: Lock, title: "Complete Auth", description: "Better Auth with Google, GitHub, Magic Links, and email/password. Session management done right." },
  { icon: Database, title: "Type-Safe Database", description: "Drizzle ORM + PostgreSQL, ready for whichever modules you turn on — SaaS, shop, content, or all three." },
  { icon: CreditCard, title: "Dual Payments", description: "Stripe and LemonSqueezy for subscriptions, plus one-time checkout for physical or digital products." },
  { icon: Shield, title: "Security First", description: "CSRF protection, rate limiting, CSP headers, HTTP-only cookies, role-based access." },
  { icon: Zap, title: "Fast By Default", description: "Next.js 15 App Router with edge middleware and a Vercel-optimized deployment config." },
  { icon: Globe, title: "Cloud Storage", description: "Cloudflare R2 or AWS S3 with presigned URLs — your server never touches raw bytes." },
  { icon: Code2, title: "One Config File", description: "Pick your site type, toggle modules, change branding — all from site-config.ts." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24 bg-muted/30">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">What's included</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            Everything you need to ship.<br />Nothing you don't.
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
