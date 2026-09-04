import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { posts } from "@/engine/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(300),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
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

  const { title, excerpt, content, coverImageUrl, status } = parsed.data;
  const [post] = await db
    .insert(posts)
    .values({
      authorId: session.user.id,
      slug: slugify(title),
      title,
      excerpt: excerpt ?? null,
      content,
      coverImageUrl: coverImageUrl ?? null,
      status,
      publishedAt: status === "published" ? new Date() : null,
    })
    .returning();

  return Response.json({ post });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const bodySchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(300).optional(),
    excerpt: z.string().max(500).optional(),
    content: z.string().min(1).optional(),
    status: z.enum(["draft", "published"]).optional(),
  });
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const { id, ...updates } = parsed.data;
  const [updated] = await db
    .update(posts)
    .set({
      ...updates,
      updatedAt: new Date(),
      ...(updates.status === "published" ? { publishedAt: new Date() } : {}),
    })
    .where(and(eq(posts.id, id), eq(posts.authorId, session.user.id)))
    .returning();

  if (!updated) return Response.json({ error: "Post not found" }, { status: 404 });
  return Response.json({ post: updated });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing post id" }, { status: 400 });

  await db.delete(posts).where(and(eq(posts.id, id), eq(posts.authorId, session.user.id)));
  return Response.json({ success: true });
}
