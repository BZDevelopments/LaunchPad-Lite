import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { documentChunks, knowledgeBases } from "@/engine/db/schema";
import { cosineDistance, desc, eq, gt, sql, and } from "drizzle-orm";
import { generateEmbedding } from "@/engine/ai";
import { rateLimit } from "@/engine/security/rate-limit";
import { z } from "zod";

const bodySchema = z.object({
  knowledgeBaseId: z.string().uuid(),
  query: z.string().min(1).max(2000),
  limit: z.number().int().min(1).max(20).default(5),
  minSimilarity: z.number().min(0).max(1).default(0.5),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { success } = await rateLimit(`rag-search:${session.user.id}`, 30, "1 m");
    if (!success) return Response.json({ error: "Too many search requests. Please slow down." }, { status: 429 });

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

    const { knowledgeBaseId, query, limit, minSimilarity } = parsed.data;

    const kb = await db.query.knowledgeBases.findFirst({
      where: and(eq(knowledgeBases.id, knowledgeBaseId), eq(knowledgeBases.userId, session.user.id)),
    });
    if (!kb) return Response.json({ error: "Knowledge base not found" }, { status: 404 });

    const queryEmbedding = await generateEmbedding(query);
    const similarity = sql<number>`1 - (${cosineDistance(documentChunks.embedding, queryEmbedding)})`;

    const results = await db
      .select({ id: documentChunks.id, content: documentChunks.content, documentId: documentChunks.documentId, chunkIndex: documentChunks.chunkIndex, similarity })
      .from(documentChunks)
      .where(and(eq(documentChunks.knowledgeBaseId, knowledgeBaseId), gt(similarity, minSimilarity)))
      .orderBy((t) => desc(t.similarity))
      .limit(limit);

    return Response.json({ results });
  } catch (error) {
    console.error("[RAG Search]", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
