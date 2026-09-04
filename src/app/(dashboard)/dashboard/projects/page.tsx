import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { projects } from "@/engine/db/schema";
import { eq, asc } from "drizzle-orm";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const rows = await db.query.projects.findMany({ where: eq(projects.ownerId, session.user.id), orderBy: [asc(projects.displayOrder)] });

  return (
    <ProjectsClient
      initialProjects={rows.map((p) => ({ id: p.id, slug: p.slug, title: p.title, summary: p.summary, published: p.published, featured: p.featured, tags: p.tags ?? [] }))}
    />
  );
}
