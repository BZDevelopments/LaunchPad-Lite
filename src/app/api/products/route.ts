import { auth } from "@/engine/auth/auth";
import { headers } from "next/headers";
import { db } from "@/engine/db/client";
import { products } from "@/engine/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priceCents: z.number().int().min(0),
  imageUrl: z.string().url().optional(),
  inventory: z.number().int().min(0).nullable().optional(),
});

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 7);
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.query.products.findMany({ where: eq(products.ownerId, session.user.id) });
  return Response.json({ products: rows });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });

  const { name, description, priceCents, imageUrl, inventory } = parsed.data;
  const [product] = await db
    .insert(products)
    .values({
      ownerId: session.user.id,
      slug: slugify(name),
      name,
      description: description ?? null,
      priceCents,
      imageUrl: imageUrl ?? null,
      inventory: inventory ?? null,
    })
    .returning();

  return Response.json({ product });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const bodySchema = z.object({
    id: z.string().uuid(),
    active: z.boolean().optional(),
    priceCents: z.number().int().min(0).optional(),
    inventory: z.number().int().min(0).nullable().optional(),
  });
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const { id, ...updates } = parsed.data;
  const [updated] = await db
    .update(products)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(products.id, id), eq(products.ownerId, session.user.id)))
    .returning();

  if (!updated) return Response.json({ error: "Product not found" }, { status: 404 });
  return Response.json({ product: updated });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing product id" }, { status: 400 });

  await db.delete(products).where(and(eq(products.id, id), eq(products.ownerId, session.user.id)));
  return Response.json({ success: true });
}
