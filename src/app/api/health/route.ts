import { db } from "@/engine/db/client";
import { sql } from "drizzle-orm";

export async function GET() {
  const start = Date.now();
  let dbStatus = "ok";
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    dbLatencyMs = Date.now() - dbStart;
  } catch {
    dbStatus = "error";
  }

  return Response.json({
    status: dbStatus === "ok" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    latencyMs: Date.now() - start,
    services: { database: { status: dbStatus, latencyMs: dbLatencyMs } },
    version: process.env.npm_package_version ?? "1.0.0",
  });
}
