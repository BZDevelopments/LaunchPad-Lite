import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { documentChunks, knowledgeBases } from "@/engine/db/schema";
import { cosineDistance, desc, eq, gt, sql, and } from "drizzle-orm";
import { generateEmbedding, streamChat } from "@/engine/ai";
import { RateLimitError } from "@/engine/security/rate-limit";
import { z } from "zod";
import type { UIMessage } from "ai";

const uiMessagePartSchema = z.object({ type: z.string() }).passthrough();
const uiMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(uiMessagePartSchema).min(1),
});

const bodySchema = z.object({
  knowledgeBaseId: z.string().uuid(),
  messages: z.array(uiMessageSchema).min(1).max(50),
});

function getLatestUserText(messages: UIMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return "";
  return lastUser.parts.filter((p): p is { type: "text"; text: string } => p.type === "text").map((p) => p.text).join(" ");
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

    const { knowledgeBaseId, messages } = parsed.data;
    const uiMessages = messages as UIMessage[];

    const kb = await db.query.knowledgeBases.findFirst({
      where: and(eq(knowledgeBases.id, knowledgeBaseId), eq(knowledgeBases.userId, session.user.id)),
    });
    if (!kb) return Response.json({ error: "Knowledge base not found" }, { status: 404 });

    const question = getLatestUserText(uiMessages);
    let systemPrompt = "You are a helpful assistant answering questions based on the user's uploaded documents.";

    if (question.trim()) {
      const queryEmbedding = await generateEmbedding(question);
      const similarity = sql<number>`1 - (${cosineDistance(documentChunks.embedding, queryEmbedding)})`;

      const relevantChunks = await db
        .select({ content: documentChunks.content, similarity })
        .from(documentChunks)
        .where(and(eq(documentChunks.knowledgeBaseId, knowledgeBaseId), gt(similarity, 0.5)))
        .orderBy((t) => desc(t.similarity))
        .limit(5);

      if (relevantChunks.length > 0) {
        const context = relevantChunks.map((c, i) => `[Excerpt ${i + 1}]\n${c.content}`).join("\n\n");
        systemPrompt = `You are a helpful assistant answering questions based on the user's uploaded documents. Use the following excerpts to answer. If the excerpts don't contain the answer, say so clearly.\n\n${context}`;
      } else {
        systemPrompt = "You are a helpful assistant answering questions based on the user's uploaded documents. No relevant excerpts were found for this question — let the user know.";
      }
    }

    const result = await streamChat({ userId: session.user.id, messages: uiMessages, systemPrompt });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json({ error: "Rate limit exceeded", message: error.message, resetAt: error.resetAt.toISOString() }, { status: 429 });
    }
    console.error("[RAG Chat]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const maxDuration = 60;
