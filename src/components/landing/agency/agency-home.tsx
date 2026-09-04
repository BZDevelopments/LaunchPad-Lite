"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { siteConfig } from "@/user-control/site-config";
import type { PortfolioProject } from "@/components/landing/portfolio/portfolio-home";

const defaultServices = [
  { title: "Strategy", description: "We start with your goals, not our template — a plan built around what actually moves your business." },
  { title: "Design", description: "Interfaces that look considered, not default. Every screen earns its place." },
  { title: "Build", description: "Production-grade code, shipped fast, maintained properly." },
];

export function AgencyHome({ projects }: { projects: PortfolioProject[] }) {
  return (
    <div>
      <section className="px-6 py-28 md:py-36 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
            {siteConfig.tagline}
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">{siteConfig.description}</p>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-all">
            Start a project <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      <section className="px-6 py-20 bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>How we work</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {defaultServices.map((service, i) => (
              <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">{i + 1}</div>
                <h3 className="mb-2 font-semibold text-foreground">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Case studies</h2>
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
              Add case studies from your dashboard's Projects tab.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project.slug} href={`/work/${project.slug}`} className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
                  <div className="aspect-[4/3] bg-muted">
                    {project.coverImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.coverImageUrl} alt={project.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="mb-1 font-semibold text-foreground">{project.title}</h3>
                    {project.summary && <p className="text-sm text-muted-foreground line-clamp-2">{project.summary}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 py-20 bg-primary/5 border-y border-primary/20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Let's build something worth shipping</h2>
          <p className="mb-8 text-muted-foreground">Tell us about your project — we'll get back to you within a day.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90 transition-all">
            Get in touch <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
