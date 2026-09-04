"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { siteConfig } from "@/user-control/site-config";
import { WaitlistForm } from "@/components/landing/waitlist-form";

export interface BlogPostSummary {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

export function ContentHome({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <div>
      <section className="px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-2xl">
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            {siteConfig.name}
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground">{siteConfig.description}</p>
          <WaitlistForm />
        </motion.div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Latest posts</h2>
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
              Publish your first post from the dashboard — it'll appear here automatically.
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, i) => (
                <motion.div key={post.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/blog/${post.slug}`} className="group flex gap-5 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                    {post.coverImageUrl && (
                      <div className="hidden h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="mb-1.5 font-semibold text-foreground group-hover:text-primary transition-colors">{post.title}</h3>
                      {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                      {post.publishedAt && (
                        <p className="mt-2 text-xs text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
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
