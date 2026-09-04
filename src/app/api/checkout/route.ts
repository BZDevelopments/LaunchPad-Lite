import { auth } from "@/engine/auth/auth";
import { createCheckoutSession } from "@/engine/payments";
import { headers } from "next/headers";
import { z } from "zod";

const bodySchema = z.object({ planId: z.string(), interval: z.enum(["month", "year"]).default("month") });

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  try {
    const url = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      planId: parsed.data.planId,
      interval: parsed.data.interval,
    });
    return Response.json({ url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create checkout";
    return Response.json({ error: msg }, { status: 500 });
  }
}
