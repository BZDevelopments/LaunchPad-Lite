import Stripe from "stripe";
import { activePaymentProvider, getPlanById, getPriceId, type PlanInterval } from "@/user-control/plans-config";
import { siteConfig } from "@/user-control/site-config";
import { db } from "@/engine/db/client";
import { subscriptions } from "@/engine/db/schema";
import { eq } from "drizzle-orm";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-04-30.basil" });
}

interface CheckoutOptions {
  userId: string;
  userEmail: string;
  planId: string;
  interval: PlanInterval;
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCheckoutSession(options: CheckoutOptions): Promise<string> {
  const plan = getPlanById(options.planId);
  if (!plan) throw new Error(`Plan ${options.planId} not found`);

  const priceId = getPriceId(plan, options.interval);
  if (!priceId) throw new Error(`Price ID not configured for ${options.planId} ${options.interval}`);

  const successUrl = options.successUrl ?? `${siteConfig.url}/dashboard/billing?success=true`;
  const cancelUrl = options.cancelUrl ?? `${siteConfig.url}/dashboard/billing?canceled=true`;

  if (activePaymentProvider === "stripe") {
    const stripe = getStripe();
    const existing = await db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, options.userId) });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: existing?.providerId ? undefined : options.userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId: options.userId, planId: options.planId },
      subscription_data: { metadata: { userId: options.userId, planId: options.planId } },
      allow_promotion_codes: true,
    });

    if (!session.url) throw new Error("Failed to create Stripe checkout session");
    return session.url;
  }

  const lsCheckoutUrl = new URL("https://checkout.lemonsqueezy.com/checkout/buy/" + priceId);
  lsCheckoutUrl.searchParams.set("checkout[email]", options.userEmail);
  lsCheckoutUrl.searchParams.set("checkout[custom][user_id]", options.userId);
  lsCheckoutUrl.searchParams.set("checkout[custom][plan_id]", options.planId);
  lsCheckoutUrl.searchParams.set("redirect_url", successUrl);
  return lsCheckoutUrl.toString();
}

export async function createCustomerPortalSession(userId: string): Promise<string> {
  const subscription = await db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, userId) });
  if (!subscription?.providerId) throw new Error("No active subscription found");

  if (activePaymentProvider === "stripe") {
    const stripe = getStripe();
    const stripeSub = await stripe.subscriptions.retrieve(subscription.providerId);
    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeSub.customer as string,
      return_url: `${siteConfig.url}/dashboard/billing`,
    });
    return portal.url;
  }

  // LemonSqueezy has no "create portal session" API — every subscription
  // webhook includes a signed customer_portal URL, stored on the row by
  // handleLemonSqueezyWebhook().
  if (!subscription.customerPortalUrl) {
    throw new Error(
      "No LemonSqueezy customer portal URL on file yet. This populates automatically after the first webhook event."
    );
  }
  return subscription.customerPortalUrl;
}

export async function handleStripeWebhook(body: string, signature: string): Promise<void> {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      if (!userId || !planId) break;

      // Placeholder period — corrected by the customer.subscription.updated
      // webhook Stripe fires immediately after checkout completes.
      await db
        .insert(subscriptions)
        .values({
          userId,
          planId,
          status: "active",
          provider: "stripe",
          providerId: session.subscription as string,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: { planId, status: "active", providerId: session.subscription as string, updatedAt: new Date() },
        });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      // Basil (2025-04-30+) moved current_period_end off the top-level
      // Subscription object onto each subscription item.
      const firstItem = sub.items.data[0];
      const periodEnd = firstItem?.current_period_end;

      await db
        .update(subscriptions)
        .set({
          status: sub.status as
            | "active" | "trialing" | "past_due" | "canceled"
            | "incomplete" | "incomplete_expired" | "unpaid" | "paused",
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId));
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const userId = sub.metadata?.userId;
      if (!userId) break;
      await db.update(subscriptions).set({ status: "canceled", planId: "free", updatedAt: new Date() }).where(eq(subscriptions.userId, userId));
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
  }
}

function mapLemonSqueezyStatus(lsStatus: string): "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "paused" {
  switch (lsStatus) {
    case "on_trial": return "trialing";
    case "active": return "active";
    case "paused": return "paused";
    case "past_due": return "past_due";
    case "unpaid": return "unpaid";
    case "cancelled":
    case "expired": return "canceled";
    default: return "active";
  }
}

interface LemonSqueezyWebhookPayload {
  meta: { event_name: string; custom_data?: { user_id?: string; plan_id?: string } };
  data: {
    id: string;
    attributes: {
      status: string;
      renews_at?: string | null;
      cancelled?: boolean;
      urls?: { customer_portal?: string };
    };
  };
}

export async function handleLemonSqueezyWebhook(rawBody: string, signatureHeader: string | null): Promise<void> {
  const secret = process.env.LS_WEBHOOK_SECRET;
  if (!secret) throw new Error("LS_WEBHOOK_SECRET is not set");
  if (!signatureHeader) throw new Error("Missing X-Signature header");

  const crypto = await import("node:crypto");
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(signatureHeader, "utf8");

  if (digest.length !== signature.length || !crypto.timingSafeEqual(digest, signature)) {
    throw new Error("Invalid LemonSqueezy webhook signature");
  }

  const payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
  const eventName = payload.meta.event_name;
  const userId = payload.meta.custom_data?.user_id;
  const planId = payload.meta.custom_data?.plan_id;
  const attrs = payload.data.attributes;

  switch (eventName) {
    case "subscription_created": {
      if (!userId || !planId) break;
      await db
        .insert(subscriptions)
        .values({
          userId,
          planId,
          status: mapLemonSqueezyStatus(attrs.status),
          provider: "lemonsqueezy",
          providerId: payload.data.id,
          customerPortalUrl: attrs.urls?.customer_portal ?? null,
          currentPeriodStart: new Date(),
          currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
          cancelAtPeriodEnd: attrs.cancelled ?? false,
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            planId,
            status: mapLemonSqueezyStatus(attrs.status),
            provider: "lemonsqueezy",
            providerId: payload.data.id,
            customerPortalUrl: attrs.urls?.customer_portal ?? null,
            currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
            updatedAt: new Date(),
          },
        });
      break;
    }

    case "subscription_updated": {
      const existing = await db.query.subscriptions.findFirst({ where: eq(subscriptions.providerId, payload.data.id) });
      if (!existing) break;
      await db
        .update(subscriptions)
        .set({
          status: mapLemonSqueezyStatus(attrs.status),
          customerPortalUrl: attrs.urls?.customer_portal ?? existing.customerPortalUrl,
          currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : existing.currentPeriodEnd,
          cancelAtPeriodEnd: attrs.cancelled ?? false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.providerId, payload.data.id));
      break;
    }

    case "subscription_cancelled":
    case "subscription_expired": {
      await db.update(subscriptions).set({ status: "canceled", planId: "free", updatedAt: new Date() }).where(eq(subscriptions.providerId, payload.data.id));
      break;
    }

    case "subscription_payment_success": {
      const existing = await db.query.subscriptions.findFirst({ where: eq(subscriptions.providerId, payload.data.id) });
      if (!existing) break;
      await db
        .update(subscriptions)
        .set({ status: "active", currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : existing.currentPeriodEnd, updatedAt: new Date() })
        .where(eq(subscriptions.providerId, payload.data.id));
      break;
    }

    case "subscription_payment_failed": {
      await db.update(subscriptions).set({ status: "past_due", updatedAt: new Date() }).where(eq(subscriptions.providerId, payload.data.id));
      break;
    }

    default:
      console.log(`[LemonSqueezy Webhook] Unhandled event: ${eventName}`);
  }
}
