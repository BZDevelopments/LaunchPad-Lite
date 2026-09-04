"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail } from "lucide-react";
import { siteConfig } from "@/user-control/site-config";

export interface PortfolioProject {
  slug: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  tags: string[];
  externalUrl: string | null;
}

export function PortfolioHome({ projects }: { projects: PortfolioProject[] }) {
  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-28 md:py-40">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">{siteConfig.tagline}</p>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
            {siteConfig.name}
          </h1>
          <p className="mb-8 max-w-xl text-lg text-muted-foreground">{siteConfig.description}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#work" className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              View my work
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              <Mail className="h-4 w-4" /> Get in touch
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Work grid */}
      <section id="work" className="px-6 pb-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Selected work</h2>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
              Add projects from your dashboard's Projects tab — they'll appear here automatically.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {projects.map((project, i) => (
                <motion.div key={project.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <Link href={project.externalUrl ?? `/work/${project.slug}`} className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl">
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {project.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.coverImageUrl} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl font-bold text-muted-foreground/30" style={{ fontFamily: "var(--font-display)" }}>
                          {project.title.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{project.title}</h3>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                      {project.summary && <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{project.summary}</p>}
                      {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
