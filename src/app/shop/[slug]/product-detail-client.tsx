"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/engine/hooks/use-cart";

interface ProductDetail {
  id: string; name: string; description: string | null; priceCents: number;
  imageUrl: string | null; inventory: number | null; currencySymbol: string;
}

export function ProductDetailClient({ product }: { product: ProductDetail }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.inventory !== null && product.inventory <= 0;

  function handleAddToCart() {
    addItem({ productId: product.id, name: product.name, priceCents: product.priceCents, imageUrl: product.imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl font-bold text-muted-foreground/30" style={{ fontFamily: "var(--font-display)" }}>{product.name.slice(0, 1)}</div>
        )}
      </div>
      <div>
        <h1 className="mb-3 text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{product.name}</h1>
        <p className="mb-6 text-2xl font-bold text-primary">{product.currencySymbol}{(product.priceCents / 100).toFixed(2)}</p>
        {product.description && <p className="mb-8 text-muted-foreground leading-relaxed">{product.description}</p>}

        {outOfStock ? (
          <button disabled className="w-full rounded-xl bg-muted py-3.5 text-sm font-semibold text-muted-foreground cursor-not-allowed">Out of Stock</button>
        ) : (
          <button onClick={handleAddToCart} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all">
            {added ? <><Check className="h-4 w-4" /> Added to cart</> : <><ShoppingCart className="h-4 w-4" /> Add to cart</>}
          </button>
        )}
      </div>
    </div>
  );
}
