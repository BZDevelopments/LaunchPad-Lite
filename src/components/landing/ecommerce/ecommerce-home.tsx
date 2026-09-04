"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/user-control/site-config";

export interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
}

export function EcommerceHome({ products }: { products: ShopProduct[] }) {
  const symbol = siteConfig.commerce.currencySymbol;

  return (
    <div>
      <section className="px-6 py-20 md:py-28 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-2xl">
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            {siteConfig.tagline}
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground">{siteConfig.description}</p>
          <Link href="#shop" className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-all">
            Shop now <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      <section id="shop" className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
              Add products from your dashboard's Products tab — they'll appear here automatically.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/shop/${product.slug}`} className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
                    <div className="aspect-square bg-muted">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl font-bold text-muted-foreground/30" style={{ fontFamily: "var(--font-display)" }}>
                          {product.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 text-sm font-semibold text-foreground line-clamp-1">{product.name}</h3>
                      <p className="text-sm font-bold text-primary">{symbol}{(product.priceCents / 100).toFixed(2)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
