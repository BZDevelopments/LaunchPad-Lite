import { siteConfig } from "@/user-control/site-config";
import { plans } from "@/user-control/plans-config";
import { db } from "@/engine/db/client";
import { projects, products, posts } from "@/engine/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { SaasHero } from "@/components/landing/saas/saas-hero";
import { FeaturesSection } from "@/components/landing/saas/features-section";
import { PricingSection } from "@/components/landing/saas/pricing-section";
import { SocialProofSection, CTASection } from "@/components/landing/saas/social-proof";
import { PortfolioHome } from "@/components/landing/portfolio/portfolio-home";
import { AgencyHome } from "@/components/landing/agency/agency-home";
import { EcommerceHome } from "@/components/landing/ecommerce/ecommerce-home";
import { ContentHome } from "@/components/landing/content/content-home";
import { MarketingHome } from "@/components/landing/marketing/marketing-home";
import { WaitlistForm } from "@/components/landing/waitlist-form";

export default async function HomePage() {
  if (siteConfig.features.waitlist) {
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
        {await renderSiteTypeHome()}
      </main>
      <SiteFooter />
    </div>
  );
}

async function renderSiteTypeHome() {
  try {
    switch (siteConfig.siteType) {
      case "portfolio": {
        const rows = await db.query.projects.findMany({
          where: and(eq(projects.published, true)),
          orderBy: [desc(projects.featured), projects.displayOrder],
          limit: 12,
        });
        return (
          <PortfolioHome
            projects={rows.map((p) => ({ slug: p.slug, title: p.title, summary: p.summary, coverImageUrl: p.coverImageUrl, tags: p.tags ?? [], externalUrl: p.externalUrl }))}
          />
        );
      }

      case "agency": {
        const rows = await db.query.projects.findMany({
          where: eq(projects.published, true),
          orderBy: [desc(projects.featured), projects.displayOrder],
          limit: 6,
        });
        return (
          <AgencyHome
            projects={rows.map((p) => ({ slug: p.slug, title: p.title, summary: p.summary, coverImageUrl: p.coverImageUrl, tags: p.tags ?? [], externalUrl: p.externalUrl }))}
          />
        );
      }

      case "ecommerce": {
        const rows = await db.query.products.findMany({ where: eq(products.active, true), orderBy: [desc(products.createdAt)], limit: 12 });
        return <EcommerceHome products={rows.map((p) => ({ id: p.id, slug: p.slug, name: p.name, priceCents: p.priceCents, imageUrl: p.imageUrl }))} />;
      }

      case "content": {
        const rows = await db.query.posts.findMany({ where: eq(posts.status, "published"), orderBy: [desc(posts.publishedAt)], limit: 10 });
        return (
          <ContentHome
            posts={rows.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, coverImageUrl: p.coverImageUrl, publishedAt: p.publishedAt?.toISOString() ?? null }))}
          />
        );
      }

      case "marketing":
        return <MarketingHome />;

      case "saas":
      default:
        return (
          <>
            <SaasHero />
            <FeaturesSection />
            <SocialProofSection />
            <PricingSection plans={plans} />
            <CTASection />
          </>
        );
    }
  } catch (error) {
    // Database not reachable / schema not pushed yet — show an empty-data
    // version of the same homepage rather than crashing the whole page.
    // This is the expected state for a fresh clone before `npm run db:push`.
    console.error("[HomePage] Failed to load site-type data:", error);
    switch (siteConfig.siteType) {
      case "portfolio":
        return <PortfolioHome projects={[]} />;
      case "agency":
        return <AgencyHome projects={[]} />;
      case "ecommerce":
        return <EcommerceHome products={[]} />;
      case "content":
        return <ContentHome posts={[]} />;
      case "marketing":
        return <MarketingHome />;
      default:
        return (
          <>
            <SaasHero />
            <FeaturesSection />
            <SocialProofSection />
            <PricingSection plans={plans} />
            <CTASection />
          </>
        );
    }
  }
}
