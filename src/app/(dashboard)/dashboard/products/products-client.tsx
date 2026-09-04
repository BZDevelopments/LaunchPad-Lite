"use client";

import { useState } from "react";
import { Plus, Loader2, X, Trash2, Package } from "lucide-react";
import { siteConfig } from "@/user-control/site-config";
import toast from "react-hot-toast";

interface Product {
  id: string; slug: string; name: string; description: string | null;
  priceCents: number; currency: string; imageUrl: string | null; active: boolean; inventory: number | null;
}

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [items, setItems] = useState(initialProducts);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [inventory, setInventory] = useState("");
  const [creating, setCreating] = useState(false);
  const symbol = siteConfig.commerce.currencySymbol;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const priceCents = Math.round(parseFloat(price) * 100);
    if (!name.trim() || isNaN(priceCents) || priceCents < 0) {
      toast.error("Enter a valid name and price");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined, priceCents, inventory: inventory ? parseInt(inventory) : null }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to create product"); return; }
      setItems((prev) => [data.product, ...prev]);
      setShowCreate(false); setName(""); setDescription(""); setPrice(""); setInventory("");
      toast.success("Product created");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(product: Product) {
    const res = await fetch("/api/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: product.id, active: !product.active }) });
    if (res.ok) setItems((prev) => prev.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p)));
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this product?")) return;
    const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage what's for sale in your store.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">New Product</h3>
            <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Price ({symbol})</label>
                <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Inventory <span className="text-muted-foreground">(blank = unlimited)</span></label>
                <input type="number" min="0" value={inventory} onChange={(e) => setInventory(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <button type="submit" disabled={creating} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Package className="h-7 w-7 text-primary" /></div>
          <h3 className="mb-1 font-semibold text-foreground">No products yet</h3>
          <p className="text-sm text-muted-foreground">Add your first product to start selling.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((product) => (
            <div key={product.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
              <div>
                <p className="font-medium text-foreground">{product.name}</p>
                <p className="text-sm text-muted-foreground">{symbol}{(product.priceCents / 100).toFixed(2)} · {product.inventory === null ? "Unlimited stock" : `${product.inventory} in stock`}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggleActive(product)} className={`rounded-full px-3 py-1 text-xs font-semibold ${product.active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                  {product.active ? "Active" : "Hidden"}
                </button>
                <button onClick={() => handleDelete(product.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
