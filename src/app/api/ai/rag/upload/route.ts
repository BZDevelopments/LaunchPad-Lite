import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { knowledgeBases, knowledgeDocuments, documentChunks } from "@/engine/db/schema";
import { eq, and } from "drizzle-orm";
import { chunkText } from "@/engine/ai/chunking";
import { generateEmbeddings } from "@/engine/ai";
import { z } from "zod";

const bodySchema = z.object({
  knowledgeBaseId: z.string().uuid(),
  name: z.string().min(1).max(255),
  content: z.string().min(1).max(2_000_000),
  fileId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });

    const { knowledgeBaseId, name, content, fileId } = parsed.data;

    const kb = await db.query.knowledgeBases.findFirst({
      where: and(eq(knowledgeBases.id, knowledgeBaseId), eq(knowledgeBases.userId, session.user.id)),
    });
    if (!kb) return Response.json({ error: "Knowledge base not found" }, { status: 404 });

    const [document] = await db
      .insert(knowledgeDocuments)
      .values({ knowledgeBaseId, fileId: fileId ?? null, name, content, status: "processing" })
      .returning();
    if (!document) return Response.json({ error: "Failed to create document" }, { status: 500 });

    try {
      const chunks = chunkText(content, { chunkSize: 500, overlap: 50 });
      if (chunks.length === 0) {
        await db.update(knowledgeDocuments).set({ status: "error" }).where(eq(knowledgeDocuments.id, document.id));
        return Response.json({ error: "Document has no extractable text content" }, { status: 400 });
      }

      const embeddings = await generateEmbeddings(chunks);
      await db.insert(documentChunks).values(
        chunks.map((chunkContent, i) => ({
          documentId: document.id,
          knowledgeBaseId,
          chunkIndex: i,
          content: chunkContent,
          embedding: embeddings[i],
        }))
      );

      await db.update(knowledgeDocuments).set({ status: "ready", chunkCount: chunks.length }).where(eq(knowledgeDocuments.id, document.id));
      return Response.json({ document: { ...document, status: "ready", chunkCount: chunks.length } });
    } catch (embeddingError) {
      console.error("[RAG Upload] Embedding failed:", embeddingError);
      await db.update(knowledgeDocuments).set({ status: "error" }).where(eq(knowledgeDocuments.id, document.id));
      return Response.json({ error: "Failed to process document. Please try again." }, { status: 500 });
    }
  } catch (error) {
    console.error("[RAG Upload]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const maxDuration = 60;
