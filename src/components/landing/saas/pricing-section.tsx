"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Plan } from "@/user-control/plans-config";

export function PricingSection({ plans }: { plans: Plan[] }) {
  const [interval, setInterval] = useState<"month" | "year">("month");

  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground">Start free. Upgrade when you need it.</p>

          <div className="mt-8 inline-flex items-center rounded-xl border border-border bg-muted p-1">
            <button onClick={() => setInterval("month")} className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${interval === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              Monthly
            </button>
            <button onClick={() => setInterval("year")} className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all ${interval === "year" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              Yearly
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">Save 20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const price = interval === "month" ? plan.monthlyPrice : plan.yearlyPrice;
            const displayPrice = price === 0 ? "Free" : `$${(price / 100).toFixed(0)}`;
            const perLabel = price === 0 ? "" : interval === "month" ? "/mo" : "/yr";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-xl ${plan.highlighted ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card"}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-md">{plan.badge}</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="mb-1 text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{displayPrice}</span>
                  <span className="text-muted-foreground">{perLabel}</span>
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.id === "free" ? "/register" : `/api/checkout?planId=${plan.id}&interval=${interval}`}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${plan.highlighted ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:opacity-90" : "border border-border bg-card text-foreground hover:bg-muted"}`}
                >
                  {plan.cta}
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
