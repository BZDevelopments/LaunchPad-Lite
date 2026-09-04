import { db } from "@/engine/db/client";
import { projects } from "@/engine/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await db.query.projects.findFirst({ where: eq(projects.slug, slug) });
  if (!project || !project.published) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>

          {project.coverImageUrl && (
            <div className="mb-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.coverImageUrl} alt={project.title} className="h-full w-full object-cover" />
            </div>
          )}

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>{project.title}</h1>
          {project.summary && <p className="mb-6 text-lg text-muted-foreground">{project.summary}</p>}

          {project.tags && project.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {project.tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{tag}</span>)}
            </div>
          )}

          {project.externalUrl && (
            <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="mb-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Visit live project <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          {project.content && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
