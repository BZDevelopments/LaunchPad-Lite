import { db } from "@/engine/db/client";
import { posts } from "@/engine/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  if (!post || post.status !== "published") notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1 px-6 py-16">
        <article className="mx-auto max-w-2xl">
          <Link href="/blog" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
          </Link>

          {post.coverImageUrl && (
            <div className="mb-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>{post.title}</h1>
          {post.publishedAt && (
            <p className="mb-8 text-sm text-muted-foreground">{post.publishedAt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
          )}

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
