import { db } from "@/engine/db/client";
import { products } from "@/engine/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { ProductDetailClient } from "./product-detail-client";
import { siteConfig } from "@/user-control/site-config";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.query.products.findFirst({ where: eq(products.slug, slug) });
  if (!product || !product.active) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <ProductDetailClient
            product={{
              id: product.id, name: product.name, description: product.description,
              priceCents: product.priceCents, imageUrl: product.imageUrl,
              inventory: product.inventory, currencySymbol: siteConfig.commerce.currencySymbol,
            }}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
