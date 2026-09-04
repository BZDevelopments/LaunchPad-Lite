import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { knowledgeBases } from "@/engine/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { KnowledgeBaseDetailClient } from "./detail-client";

export default async function KnowledgeBaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const kb = await db.query.knowledgeBases.findFirst({
    where: and(eq(knowledgeBases.id, id), eq(knowledgeBases.userId, session.user.id)),
    with: { documents: { orderBy: (docs, { desc }) => [desc(docs.createdAt)] } },
  });

  if (!kb) notFound();

  return (
    <KnowledgeBaseDetailClient
      knowledgeBase={{ id: kb.id, name: kb.name, description: kb.description }}
      initialDocuments={kb.documents.map((d) => ({ id: d.id, name: d.name, status: d.status, chunkCount: d.chunkCount ?? 0, createdAt: d.createdAt.toISOString() }))}
    />
  );
}
