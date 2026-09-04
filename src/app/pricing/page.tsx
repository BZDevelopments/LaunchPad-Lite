import type { Metadata } from "next";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { PricingSection } from "@/components/landing/saas/pricing-section";
import { plans } from "@/user-control/plans-config";
import { siteConfig } from "@/user-control/site-config";

export const metadata: Metadata = { title: "Pricing", description: `Simple, transparent pricing for ${siteConfig.name}.` };

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1">
        <div className="px-6 pt-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>Pricing</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Choose the plan that fits where you are. Upgrade or downgrade anytime.</p>
        </div>
        <PricingSection plans={plans} />
      </main>
      <SiteFooter />
    </div>
  );
}
