import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { posts } from "@/engine/db/schema";
import { eq, desc } from "drizzle-orm";
import { PostsClient } from "./posts-client";

export default async function PostsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const rows = await db.query.posts.findMany({ where: eq(posts.authorId, session.user.id), orderBy: [desc(posts.createdAt)] });

  return (
    <PostsClient
      initialPosts={rows.map((p) => ({ id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, status: p.status, createdAt: p.createdAt.toISOString() }))}
    />
  );
}
