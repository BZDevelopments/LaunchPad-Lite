import { auth } from "@/engine/auth/auth";
import { createProductCheckout } from "@/engine/commerce";
import { headers } from "next/headers";
import { z } from "zod";

const bodySchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(99) })).min(1),
  customerEmail: z.string().email().optional(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });

  // Guest checkout is allowed for shop sites — attach userId only if signed in
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    const url = await createProductCheckout({
      items: parsed.data.items,
      customerEmail: parsed.data.customerEmail ?? session?.user.email,
      userId: session?.user.id,
    });
    return Response.json({ url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Checkout failed";
    return Response.json({ error: msg }, { status: 400 });
  }
}
