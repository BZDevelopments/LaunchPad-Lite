import Stripe from "stripe";
import { db } from "@/engine/db/client";
import { products, orders, orderItems } from "@/engine/db/schema";
import { eq, inArray } from "drizzle-orm";
import { siteConfig } from "@/user-control/site-config";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-04-30.basil" });
}

interface CartLine {
  productId: string;
  quantity: number;
}

/**
 * Creates a one-time-payment Stripe Checkout session for a cart of
 * products. Distinct from createCheckoutSession() in engine/payments —
 * that one is for recurring subscriptions, this one is `mode: "payment"`
 * for a single purchase, which is what an e-commerce storefront needs.
 */
export async function createProductCheckout(options: {
  items: CartLine[];
  customerEmail?: string;
  userId?: string;
}): Promise<string> {
  if (options.items.length === 0) throw new Error("Cart is empty");

  const productIds = options.items.map((i) => i.productId);
  const dbProducts = await db.query.products.findMany({
    where: inArray(products.id, productIds),
  });

  if (dbProducts.length !== productIds.length) {
    throw new Error("One or more products in the cart no longer exist");
  }

  const lineItems = options.items.map((item) => {
    const product = dbProducts.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (!product.active) throw new Error(`${product.name} is no longer available`);
    if (product.inventory !== null && product.inventory < item.quantity) {
      throw new Error(`Not enough stock for ${product.name}`);
    }
    return {
      price_data: {
        currency: product.currency.toLowerCase(),
        product_data: { name: product.name, description: product.description ?? undefined },
        unit_amount: product.priceCents,
      },
      quantity: item.quantity,
    };
  });

  const totalCents = options.items.reduce((sum, item) => {
    const product = dbProducts.find((p) => p.id === item.productId)!;
    return sum + product.priceCents * item.quantity;
  }, 0);

  // Create a pending order row up front so the webhook has something to
  // update instead of inserting blind — also means abandoned checkouts are
  // visible in the admin panel as "pending", not invisible.
  const [order] = await db
    .insert(orders)
    .values({
      userId: options.userId ?? null,
      customerEmail: options.customerEmail ?? "unknown@pending.checkout",
      status: "pending",
      totalCents,
      currency: siteConfig.commerce.currency,
      provider: "stripe",
    })
    .returning();

  if (!order) throw new Error("Failed to create order record");

  await db.insert(orderItems).values(
    options.items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId)!;
      return {
        orderId: order.id,
        productId: product.id,
        productName: product.name,
        unitPriceCents: product.priceCents,
        quantity: item.quantity,
      };
    })
  );

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: options.customerEmail,
    line_items: lineItems,
    success_url: `${siteConfig.url}/shop?order=${order.id}&success=true`,
    cancel_url: `${siteConfig.url}/cart?canceled=true`,
    metadata: { orderId: order.id },
  });

  if (!session.url) throw new Error("Failed to create checkout session");

  await db.update(orders).set({ providerSessionId: session.id }).where(eq(orders.id, order.id));

  return session.url;
}

/**
 * Handles the commerce-specific Stripe events (one-time payment
 * completion). Called from the same /api/webhooks/stripe route as the
 * subscription handler — dispatches by whether metadata.orderId is present
 * vs metadata.userId (subscription checkout).
 */
export async function handleProductCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.orderId;
  if (!orderId) return; // Not a product checkout — let the subscription handler deal with it

  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId), with: { items: true } });
  if (!order) return;

  await db.update(orders).set({ status: "paid", updatedAt: new Date() }).where(eq(orders.id, orderId));

  // Decrement inventory for tracked (non-digital/unlimited) products
  for (const item of order.items) {
    const product = await db.query.products.findFirst({ where: eq(products.id, item.productId) });
    if (product?.inventory !== null && product?.inventory !== undefined) {
      await db
        .update(products)
        .set({ inventory: Math.max(0, product.inventory - item.quantity) })
        .where(eq(products.id, item.productId));
    }
  }
}
