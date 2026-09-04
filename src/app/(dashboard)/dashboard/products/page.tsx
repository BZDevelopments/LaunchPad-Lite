import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { products } from "@/engine/db/schema";
import { eq, desc } from "drizzle-orm";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const rows = await db.query.products.findMany({ where: eq(products.ownerId, session.user.id), orderBy: [desc(products.createdAt)] });

  return (
    <ProductsClient
      initialProducts={rows.map((p) => ({
        id: p.id, slug: p.slug, name: p.name, description: p.description, priceCents: p.priceCents,
        currency: p.currency, imageUrl: p.imageUrl, active: p.active, inventory: p.inventory,
      }))}
    />
  );
}
