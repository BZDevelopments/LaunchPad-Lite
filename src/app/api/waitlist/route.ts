import { db } from "@/engine/db/client";
import { waitlist } from "@/engine/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/engine/security/rate-limit";
import { z } from "zod";

const bodySchema = z.object({ email: z.string().email(), referredBy: z.string().optional() });

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await rateLimit(`waitlist:${ip}`, 5, "1 m");
    if (!success) return Response.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });

    const contentType = request.headers.get("content-type") ?? "";
    let raw: Record<string, unknown>;
    if (contentType.includes("application/json")) {
      raw = await request.json();
    } else {
      const form = await request.formData();
      raw = Object.fromEntries(form.entries());
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });

    const { email, referredBy } = parsed.data;
    const existing = await db.query.waitlist.findFirst({ where: eq(waitlist.email, email) });
    if (existing) return Response.json({ success: true, alreadyJoined: true });

    await db.insert(waitlist).values({ email, referredBy: referredBy ?? null });
    return Response.json({ success: true });
  } catch (error) {
    console.error("[Waitlist API]", error);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
