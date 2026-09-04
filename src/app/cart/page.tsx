"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { useCart } from "@/engine/hooks/use-cart";
import { siteConfig } from "@/user-control/site-config";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalCents } = useCart();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const symbol = siteConfig.commerce.currencySymbol;

  async function handleCheckout() {
    if (!email.trim()) { toast.error("Enter your email to continue"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })), customerEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Checkout failed"); return; }
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Your Cart</h1>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><ShoppingBag className="h-7 w-7 text-primary" /></div>
              <h3 className="mb-4 font-semibold text-foreground">Your cart is empty</h3>
              <Link href="/" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue shopping</Link>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{symbol}{(item.priceCents / 100).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>{symbol}{(totalCents / 100).toFixed(2)}</span>
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="mb-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={handleCheckout} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-60">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
