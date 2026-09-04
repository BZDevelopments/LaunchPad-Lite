import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { leads } from "@/engine/db/schema";
import { desc } from "drizzle-orm";
import { LeadsClient } from "./leads-client";

export default async function LeadsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const rows = await db.query.leads.findMany({ orderBy: [desc(leads.createdAt)], limit: 200 });

  return (
    <LeadsClient
      initialLeads={rows.map((l) => ({ id: l.id, name: l.name, email: l.email, company: l.company, message: l.message, status: l.status, source: l.source, createdAt: l.createdAt.toISOString() }))}
    />
  );
}
