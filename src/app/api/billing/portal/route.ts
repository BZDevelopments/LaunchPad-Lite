import { auth } from "@/engine/auth/auth";
import { createCustomerPortalSession } from "@/engine/payments";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = await createCustomerPortalSession(session.user.id);
    return Response.json({ url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to open portal";
    return Response.json({ error: msg }, { status: 500 });
  }
}
