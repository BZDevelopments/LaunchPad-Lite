import { db } from "@/engine/db/client";
import { leads } from "@/engine/db/schema";
import { sendContactNotification } from "@/engine/email/send";
import { rateLimit } from "@/engine/security/rate-limit";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
  source: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await rateLimit(`contact:${ip}`, 5, "1 h");
    if (!success) return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: "Please fill in all required fields correctly." }, { status: 400 });

    const { name, email, company, message, source } = parsed.data;

    await db.insert(leads).values({ name, email, company: company ?? null, message, source: source ?? "contact-page" });
    // Fire-and-forget — the lead is already saved even if email fails
    void sendContactNotification({ name, email, company, message });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Contact API]", error);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
