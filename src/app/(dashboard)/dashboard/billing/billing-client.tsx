"use client";

import { useState } from "react";
import { Check, Loader2, ExternalLink, CreditCard, AlertTriangle } from "lucide-react";
import type { Plan } from "@/user-control/plans-config";
import toast from "react-hot-toast";

interface BillingClientProps {
  currentPlan: Plan | null;
  subscription: { status: string; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean } | null;
  allPlans: Plan[];
}

export function BillingClient({ currentPlan, subscription, allPlans }: BillingClientProps) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleUpgrade(planId: string) {
    if (planId === currentPlan?.id) return;
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId, interval }) });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else toast.error(data.error ?? "Failed to create checkout session");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.open(data.url, "_blank");
      else toast.error(data.error ?? "Failed to open billing portal");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Billing & Subscription</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your plan and payment details.</p>
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">{currentPlan?.name ?? "Free"}</h2>
            {subscription && (
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${subscription.status === "active" ? "bg-green-500/10 text-green-600" : subscription.status === "past_due" ? "bg-red-500/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{subscription.status}</span>
                {subscription.cancelAtPeriodEnd && <span className="flex items-center gap-1 text-xs text-orange-500"><AlertTriangle className="h-3 w-3" />Cancels {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "soon"}</span>}
                {subscription.currentPeriodEnd && !subscription.cancelAtPeriodEnd && <span className="text-xs text-muted-foreground">Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>}
              </div>
            )}
          </div>
          {subscription && currentPlan?.id !== "free" && (
            <button onClick={handlePortal} disabled={portalLoading} className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-60">
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />} Manage Billing
            </button>
          )}
        </div>

        {currentPlan && (
          <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
            {[
              { label: "AI Requests / Day", value: currentPlan.limits.aiRequestsPerDay === -1 ? "Unlimited" : currentPlan.limits.aiRequestsPerDay },
              { label: "Storage", value: `${currentPlan.limits.storageGB} GB` },
              { label: "Knowledge Bases", value: currentPlan.limits.knowledgeBases === -1 ? "Unlimited" : currentPlan.limits.knowledgeBases },
            ].map((limit) => (
              <div key={limit.label} className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">{limit.label}</p>
                <p className="mt-0.5 font-semibold text-foreground">{String(limit.value)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Change Plan</h3>
          <div className="flex items-center rounded-xl border border-border bg-muted p-1">
            <button onClick={() => setInterval("month")} className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${interval === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Monthly</button>
            <button onClick={() => setInterval("year")} className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${interval === "year" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Yearly <span className="rounded-full bg-primary/15 px-1.5 text-primary">−20%</span></button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {allPlans.map((plan) => {
            const price = interval === "month" ? plan.monthlyPrice : plan.yearlyPrice;
            const isCurrentPlan = plan.id === (currentPlan?.id ?? "free");
            return (
              <div key={plan.id} className={`relative rounded-xl border p-5 transition-shadow ${plan.highlighted ? "border-primary/40 bg-primary/5" : "border-border bg-card"} ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}>
                {isCurrentPlan && <div className="absolute -top-2.5 left-4"><span className="rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">Current</span></div>}
                <h4 className="font-bold text-foreground">{plan.name}</h4>
                <div className="my-3"><span className="text-2xl font-bold text-foreground">{price === 0 ? "Free" : `$${(price / 100).toFixed(0)}`}</span>{price > 0 && <span className="text-muted-foreground">/{interval === "month" ? "mo" : "yr"}</span>}</div>
                <ul className="mb-4 space-y-1.5">
                  {plan.features.slice(0, 4).map((f) => <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground"><Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />{f}</li>)}
                </ul>
                <button onClick={() => handleUpgrade(plan.id)} disabled={isCurrentPlan || !!loadingPlan} className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${isCurrentPlan ? "border border-border bg-muted text-muted-foreground cursor-default" : plan.highlighted ? "bg-primary text-primary-foreground hover:opacity-90" : "border border-border bg-card text-foreground hover:bg-muted"} disabled:opacity-60`}>
                  {loadingPlan === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isCurrentPlan ? "Current Plan" : <><CreditCard className="h-3.5 w-3.5" />{plan.id === "free" ? "Downgrade" : "Upgrade"}</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
