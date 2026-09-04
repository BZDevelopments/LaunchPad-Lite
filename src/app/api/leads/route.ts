import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { leads } from "@/engine/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const bodySchema = z.object({ id: z.string().uuid(), status: z.enum(["new", "contacted", "closed", "archived"]) });
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const [updated] = await db.update(leads).set({ status: parsed.data.status }).where(eq(leads.id, parsed.data.id)).returning();
  if (!updated) return Response.json({ error: "Lead not found" }, { status: 404 });
  return Response.json({ lead: updated });
}
