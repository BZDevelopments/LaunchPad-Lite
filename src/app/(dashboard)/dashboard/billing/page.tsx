import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { subscriptions } from "@/engine/db/schema";
import { eq } from "drizzle-orm";
import { plans, getPlanById } from "@/user-control/plans-config";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const sub = await db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, session.user.id) });
  const currentPlan = getPlanById(sub?.planId ?? "free");

  return (
    <BillingClient
      currentPlan={currentPlan ?? null}
      subscription={sub ? { status: sub.status, currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null, cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false } : null}
      allPlans={plans}
    />
  );
}
