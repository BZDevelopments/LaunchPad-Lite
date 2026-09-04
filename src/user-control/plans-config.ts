/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║              LAUNCHPAD — SUBSCRIPTION PLANS                      ║
 * ║  Only relevant if siteType is "saas" (or any site with recurring ║
 * ║  billing). E-commerce one-time purchases are configured          ║
 * ║  separately per-product in the dashboard, not here.              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export type PlanInterval = "month" | "year";

export interface Plan {
  id: string;
  name: string;
  description: string;
  badge?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    aiRequestsPerDay: number;
    storageGB: number;
    teamMembers: number;
    projects: number;
    knowledgeBases: number;
  };
  stripe: {
    monthlyPriceId: string;
    yearlyPriceId: string;
    productId: string;
  };
  lemonsqueezy: {
    monthlyVariantId: string;
    yearlyVariantId: string;
    productId: string;
  };
  highlighted?: boolean;
  cta: string;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "For individuals exploring the platform.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["10 AI requests / day", "1 Knowledge Base", "100 MB storage", "Community support"],
    limits: { aiRequestsPerDay: 10, storageGB: 0.1, teamMembers: 1, projects: 1, knowledgeBases: 1 },
    stripe: { monthlyPriceId: "", yearlyPriceId: "", productId: "" },
    lemonsqueezy: { monthlyVariantId: "", yearlyVariantId: "", productId: "" },
    cta: "Get Started Free",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals who need more power.",
    badge: "Most Popular",
    highlighted: true,
    monthlyPrice: 2900,
    yearlyPrice: 27900,
    features: [
      "100 AI requests / day",
      "5 Knowledge Bases",
      "10 GB storage",
      "Image generation (500/mo)",
      "Priority email support",
      "API access",
    ],
    limits: { aiRequestsPerDay: 100, storageGB: 10, teamMembers: 1, projects: -1, knowledgeBases: 5 },
    stripe: {
      monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
      yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "",
      productId: process.env.STRIPE_PRO_PRODUCT_ID ?? "",
    },
    lemonsqueezy: {
      monthlyVariantId: process.env.LS_PRO_MONTHLY_VARIANT_ID ?? "",
      yearlyVariantId: process.env.LS_PRO_YEARLY_VARIANT_ID ?? "",
      productId: process.env.LS_PRO_PRODUCT_ID ?? "",
    },
    cta: "Start Pro",
  },
  {
    id: "team",
    name: "Team",
    description: "For teams building at scale.",
    monthlyPrice: 7900,
    yearlyPrice: 75900,
    features: [
      "Unlimited AI requests",
      "Unlimited Knowledge Bases",
      "100 GB storage",
      "Unlimited image generation",
      "Up to 5 team members",
      "Dedicated support",
      "Custom AI system prompts",
      "Webhook integrations",
    ],
    limits: { aiRequestsPerDay: -1, storageGB: 100, teamMembers: 5, projects: -1, knowledgeBases: -1 },
    stripe: {
      monthlyPriceId: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID ?? "",
      yearlyPriceId: process.env.STRIPE_TEAM_YEARLY_PRICE_ID ?? "",
      productId: process.env.STRIPE_TEAM_PRODUCT_ID ?? "",
    },
    lemonsqueezy: {
      monthlyVariantId: process.env.LS_TEAM_MONTHLY_VARIANT_ID ?? "",
      yearlyVariantId: process.env.LS_TEAM_YEARLY_VARIANT_ID ?? "",
      productId: process.env.LS_TEAM_PRODUCT_ID ?? "",
    },
    cta: "Start Team",
  },
];

export const activePaymentProvider = (process.env.PAYMENT_PROVIDER ?? "stripe") as
  | "stripe"
  | "lemonsqueezy";

export function getPlanById(id: string): Plan | undefined {
  return plans.find((p) => p.id === id);
}

export function getPriceId(plan: Plan, interval: PlanInterval): string {
  if (activePaymentProvider === "stripe") {
    return interval === "month" ? plan.stripe.monthlyPriceId : plan.stripe.yearlyPriceId;
  }
  return interval === "month" ? plan.lemonsqueezy.monthlyVariantId : plan.lemonsqueezy.yearlyVariantId;
}
