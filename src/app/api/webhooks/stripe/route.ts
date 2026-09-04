import { handleStripeWebhook } from "@/engine/payments";
import { handleProductCheckoutCompleted } from "@/engine/commerce";
import { siteConfig } from "@/user-control/site-config";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature" }, { status: 400 });

  try {
    // Product (one-time) checkouts and subscription checkouts share the
    // same webhook endpoint but are handled by different engines —
    // dispatch by presence of metadata.orderId vs metadata.userId.
    if (siteConfig.features.modules.shop) {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (webhookSecret) {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (stripeKey) {
          const stripe = new Stripe(stripeKey, { apiVersion: "2025-04-30.basil" });
          const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
          if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            if (session.metadata?.orderId) {
              await handleProductCheckoutCompleted(session);
              return Response.json({ received: true });
            }
          }
        }
      }
    }

    await handleStripeWebhook(body, signature);
    return Response.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook]", error);
    return Response.json({ error: "Webhook handling failed" }, { status: 400 });
  }
}

export const config = { api: { bodyParser: false } };
