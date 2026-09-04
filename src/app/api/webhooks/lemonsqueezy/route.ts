import { handleLemonSqueezyWebhook } from "@/engine/payments";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-signature");

  try {
    await handleLemonSqueezyWebhook(body, signature);
    return Response.json({ received: true });
  } catch (error) {
    console.error("[LemonSqueezy Webhook]", error);
    return Response.json({ error: "Webhook handling failed" }, { status: 400 });
  }
}

export const config = { api: { bodyParser: false } };
