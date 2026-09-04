import { db } from "@/engine/db/client";
import { posts } from "@/engine/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { Newspaper } from "lucide-react";
import { siteConfig } from "@/user-control/site-config";

export default async function BlogIndexPage() {
  let rows: Awaited<ReturnType<typeof db.query.posts.findMany>> = [];
  try {
    rows = await db.query.posts.findMany({ where: eq(posts.status, "published"), orderBy: [desc(posts.publishedAt)] });
  } catch (error) {
    // Table not created yet (schema not pushed) or a transient DB issue —
    // show the same empty state a fresh install would show, rather than
    // crashing the whole page.
    console.error("[BlogIndexPage] Failed to load posts:", error);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>Blog</h1>

          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <Newspaper className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No posts yet. Publish one from your dashboard.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {rows.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                  <h2 className="mb-1.5 font-semibold text-foreground group-hover:text-primary transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                  {post.publishedAt && <p className="mt-2 text-xs text-muted-foreground">{post.publishedAt.toLocaleDateString()}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
