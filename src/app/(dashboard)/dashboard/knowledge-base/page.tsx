import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { knowledgeBases } from "@/engine/db/schema";
import { eq, desc } from "drizzle-orm";
import { KnowledgeBaseListClient } from "./list-client";

export default async function KnowledgeBasePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const kbs = await db.query.knowledgeBases.findMany({
    where: eq(knowledgeBases.userId, session.user.id),
    orderBy: [desc(knowledgeBases.createdAt)],
    with: { documents: true },
  });

  return (
    <KnowledgeBaseListClient
      initialKnowledgeBases={kbs.map((kb) => ({ id: kb.id, name: kb.name, description: kb.description, documentCount: kb.documents.length, createdAt: kb.createdAt.toISOString() }))}
    />
  );
}
