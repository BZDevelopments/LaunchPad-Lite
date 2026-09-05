"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Database, Zap, Code2, Moon, GitFork } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Better Auth",
    description: "Email/password, Google, and GitHub sign-in wired up. Sessions, verification emails, and password reset all included.",
  },
  {
    icon: Database,
    title: "Drizzle ORM",
    description: "Type-safe queries with Drizzle ORM and PostgreSQL. Run db:push and your schema is live.",
  },
  {
    icon: Zap,
    title: "Next.js 15 App Router",
    description: "Server components, server actions, and streaming — the modern way to build.",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    description: "Light and dark themes out of the box, driven by next-themes with zero flash.",
  },
  {
    icon: Code2,
    title: "TypeScript",
    description: "Fully typed from the database schema to the UI. No any, no surprises.",
  },
  {
    icon: GitFork,
    title: "Open Source",
    description: "MIT licensed. Fork it, use it, ship it. Upgrade to Pro when you need payments, AI, or more.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">What you get</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            Everything a SaaS needs to start
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            The boring infrastructure, handled. So you can focus on the thing only you can build.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
