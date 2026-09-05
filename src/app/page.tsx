import { siteConfig } from "@/user-control/site-config";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { SaasHero } from "@/components/landing/saas/saas-hero";
import { FeaturesSection } from "@/components/landing/saas/features-section";
import { PricingSection } from "@/components/landing/saas/pricing-section";
import { SocialProofSection, CTASection } from "@/components/landing/saas/social-proof";
import { WaitlistForm } from "@/components/landing/waitlist-form";

export default function HomePage() {
  if (siteConfig.features?.waitlist) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            {siteConfig.name} is coming soon
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">{siteConfig.description}</p>
          <WaitlistForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1">
        <SaasHero />
        <FeaturesSection />
        <SocialProofSection />
        <PricingSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
