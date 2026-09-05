import { PricingSection } from "@/components/landing/saas/pricing-section";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1 pt-12">
        <PricingSection />
      </main>
      <SiteFooter />
    </div>
  );
}
