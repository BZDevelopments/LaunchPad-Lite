import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { projects } from "@/engine/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(300),
  summary: z.string().max(500).optional(),
  content: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  externalUrl: z.string().url().optional(),
  tags: z.array(z.string()).max(10).optional(),
  featured: z.boolean().optional(),
});

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 7);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });

  const { title, summary, content, coverImageUrl, externalUrl, tags, featured } = parsed.data;
  const [project] = await db
    .insert(projects)
    .values({
      ownerId: session.user.id,
      slug: slugify(title),
      title,
      summary: summary ?? null,
      content: content ?? null,
      coverImageUrl: coverImageUrl ?? null,
      externalUrl: externalUrl ?? null,
      tags: tags ?? [],
      featured: featured ?? false,
    })
    .returning();

  return Response.json({ project });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const bodySchema = z.object({
    id: z.string().uuid(),
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
    displayOrder: z.number().int().optional(),
  });
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const { id, ...updates } = parsed.data;
  const [updated] = await db.update(projects).set(updates).where(and(eq(projects.id, id), eq(projects.ownerId, session.user.id))).returning();
  if (!updated) return Response.json({ error: "Project not found" }, { status: 404 });
  return Response.json({ project: updated });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing project id" }, { status: 400 });

  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.ownerId, session.user.id)));
  return Response.json({ success: true });
}
