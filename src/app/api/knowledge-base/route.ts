import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { knowledgeBases, subscriptions } from "@/engine/db/schema";
import { eq } from "drizzle-orm";
import { getPlanById } from "@/user-control/plans-config";
import { z } from "zod";

const bodySchema = z.object({ name: z.string().min(1).max(200), description: z.string().max(1000).optional() });

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const [sub, existingKbs] = await Promise.all([
    db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, session.user.id) }),
    db.query.knowledgeBases.findMany({ where: eq(knowledgeBases.userId, session.user.id) }),
  ]);
  const plan = getPlanById(sub?.planId ?? "free");
  const limit = plan?.limits.knowledgeBases ?? 1;

  if (limit !== -1 && existingKbs.length >= limit) {
    return Response.json({ error: `Your plan allows up to ${limit} knowledge base${limit === 1 ? "" : "s"}. Upgrade to create more.` }, { status: 403 });
  }

  const [kb] = await db.insert(knowledgeBases).values({ userId: session.user.id, name: parsed.data.name, description: parsed.data.description ?? null }).returning();
  return Response.json({ knowledgeBase: kb });
}
